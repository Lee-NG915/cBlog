/**
 * Outbox PostgreSQL 集成测试（REL-002/REL-004、STATIC-006）。
 * 需要 TEST_DATABASE_URL（仅允许 127.0.0.1:54329/cblog），未设置时整组 skip。
 * 与 packages/core 集成测试同模式：drop schema 后跑 drizzle migration 自建夹具，
 * 不依赖库中现有数据（staging 库可能有并行任务的测试数据）。
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  closePostgresDb,
  createPostgresDb,
  type PostgresDbHandle,
} from "@cblog/core/postgres";
import { migratePostgres } from "../../../../packages/core/src/db/postgres/migrate";
import {
  claimNextBatch,
  markFailed,
  markRetryLater,
  reclaimStaleDelivering,
  resetFailedForRetry,
  type Sql,
} from "../outbox/events";
import { tick, type TickDeps } from "../outbox/worker";

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

function assertSafeTestDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const database = url.pathname.replace(/^\//, "");
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "54329" ||
    database !== "cblog"
  ) {
    throw new Error("PostgreSQL 集成测试只允许 127.0.0.1:54329/cblog");
  }
}

async function insertEvent(sql: Sql, slug: string): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    insert into publication_events (entity_type, operation, payload_json)
    values ('post', 'publish', ${JSON.stringify({ slug })})
    returning id
  `;
  return rows[0].id;
}

async function eventState(sql: Sql, id: string) {
  const rows = await sql<
    {
      status: string;
      attempt_count: number;
      /** postgres.js 此处返回 ISO 字符串而非 Date，统一包一层 */
      next_attempt_at: string | Date | null;
      last_error: string | null;
      deployment_id: string | null;
    }[]
  >`
    select status, attempt_count, next_attempt_at, last_error, deployment_id
    from publication_events where id = ${id}
  `;
  const row = rows[0];
  return {
    ...row,
    next_attempt_at: row.next_attempt_at
      ? new Date(row.next_attempt_at)
      : null,
  };
}

describe.skipIf(!testDatabaseUrl)("outbox PostgreSQL integration", () => {
  let handle: PostgresDbHandle;
  let sql: Sql;

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    handle = createPostgresDb(testDatabaseUrl!, { max: 4 });
    sql = handle.client;
    await sql.unsafe("drop schema if exists public cascade");
    await sql.unsafe("drop schema if exists drizzle cascade");
    await sql.unsafe("create schema public");
    await migratePostgres(handle);
  }, 30_000);

  beforeEach(async () => {
    await sql.unsafe(`
      truncate table
        publication_deployment_events,
        publication_events,
        publication_deployments
      cascade
    `);
  });

  afterAll(async () => {
    if (handle) await closePostgresDb(handle);
  });

  it("两个并发 claimNextBatch 不重复领同一事件（REL-004）", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 20; i++) ids.push(await insertEvent(sql, `post-${i}`));

    const [batchA, batchB] = await Promise.all([
      claimNextBatch(sql, 10),
      claimNextBatch(sql, 10),
    ]);
    expect(batchA).toHaveLength(10);
    expect(batchB).toHaveLength(10);

    const claimedIds = [...batchA, ...batchB].map((event) => event.id);
    expect(new Set(claimedIds).size).toBe(20);
    expect([...claimedIds].sort()).toEqual([...ids].sort());

    // 认领即置 delivering、attempt+1
    for (const event of [...batchA, ...batchB]) {
      expect(event.attemptCount).toBe(1);
      const state = await eventState(sql, event.id);
      expect(state.status).toBe("delivering");
    }
    // 全部领完后再 claim 为空
    expect(await claimNextBatch(sql, 10)).toHaveLength(0);
  });

  it("delivering 超租回收回 pending，attempt 不增", async () => {
    const id = await insertEvent(sql, "stale");
    await claimNextBatch(sql, 10);

    // 未超租：不回收
    expect(await reclaimStaleDelivering(sql, 60)).toBe(0);

    // 把租约起点拨回 120s 前：超租回收
    await sql`
      update publication_events
      set next_attempt_at = now() - interval '120 seconds'
      where id = ${id}
    `;
    expect(await reclaimStaleDelivering(sql, 60)).toBe(1);

    const state = await eventState(sql, id);
    expect(state.status).toBe("pending");
    expect(state.attempt_count).toBe(1);
    expect(state.next_attempt_at).toBeNull();

    // 回收后可再次被认领
    const batch = await claimNextBatch(sql, 10);
    expect(batch.map((event) => event.id)).toEqual([id]);
    expect(batch[0].attemptCount).toBe(2);
  });

  it("投递失败按退避序列推迟，nextAttemptAt 随 attempt 递增", async () => {
    const id = await insertEvent(sql, "backoff");

    await claimNextBatch(sql, 10); // attempt 1
    expect(await markRetryLater(sql, id, "boom-1", 8)).toBe("retry");
    const first = await eventState(sql, id);
    expect(first.status).toBe("pending");
    expect(first.last_error).toBe("boom-1");
    const firstDelayMs = first.next_attempt_at!.getTime() - Date.now();
    expect(firstDelayMs).toBeGreaterThan(3_000);
    expect(firstDelayMs).toBeLessThanOrEqual(5_500);

    // 未到点不可认领；到点后认领为 attempt 2，退避升为 30s
    expect(await claimNextBatch(sql, 10)).toHaveLength(0);
    await sql`update publication_events set next_attempt_at = null where id = ${id}`;
    await claimNextBatch(sql, 10);
    expect(await markRetryLater(sql, id, "boom-2", 8)).toBe("retry");
    const second = await eventState(sql, id);
    const secondDelayMs = second.next_attempt_at!.getTime() - Date.now();
    expect(secondDelayMs).toBeGreaterThan(25_000);
    expect(secondDelayMs).toBeLessThanOrEqual(30_500);
    expect(secondDelayMs).toBeGreaterThan(firstDelayMs);
  });

  it("attempt 耗尽转 failed 并记录 last_error", async () => {
    const id = await insertEvent(sql, "exhausted");
    await sql`update publication_events set attempt_count = 7 where id = ${id}`;

    const batch = await claimNextBatch(sql, 10); // attempt 8 = max
    expect(batch[0].attemptCount).toBe(8);
    expect(await markRetryLater(sql, id, "permanent failure", 8)).toBe("failed");

    const state = await eventState(sql, id);
    expect(state.status).toBe("failed");
    expect(state.last_error).toBe("permanent failure");
    expect(state.next_attempt_at).toBeNull();
  });

  it("failed 事件 retry 复位：回 pending、attempt 清零，可再次投递", async () => {
    const id = await insertEvent(sql, "retry-me");
    await claimNextBatch(sql, 10);
    await markFailed(sql, id, "gave up");

    expect(await resetFailedForRetry(sql, id)).toBe(true);
    const state = await eventState(sql, id);
    expect(state.status).toBe("pending");
    expect(state.attempt_count).toBe(0);
    expect(state.next_attempt_at).toBeNull();
    expect(state.last_error).toBeNull();

    // 非 failed 状态不复位（幂等保护）
    expect(await resetFailedForRetry(sql, id)).toBe(false);

    // 复位后按全新事件重新走 claim 流程
    const batch = await claimNextBatch(sql, 10);
    expect(batch[0].attemptCount).toBe(1);
  });

  it("静态驱动合批：同窗口两事件只触发一次 dispatch，共享一个 deployment（STATIC-006）", async () => {
    const idA = await insertEvent(sql, "batch-a");
    const idB = await insertEvent(sql, "batch-b");

    const delivered: string[] = [];
    const logLines: string[] = [];
    const deps: TickDeps = {
      sql,
      driver: "github-dispatch",
      deliver: async (_event, options) => {
        delivered.push("dispatch");
        return {
          outcome: "awaiting_deploy",
          externalId: options?.externalId ?? "",
        };
      },
      target: "owner/repo",
      batchWindowSeconds: 0,
      maxAttempts: 8,
      claimTimeoutSeconds: 60,
      deployTimeoutSeconds: 1800,
      log: (line) => logLines.push(line),
    };

    await tick(deps);

    // 只 dispatch 一次；两事件都挂到同一个 running deployment
    expect(delivered).toHaveLength(1);
    const deployments = await sql<
      { id: string; status: string; external_id: string | null }[]
    >`select id, status, external_id from publication_deployments`;
    expect(deployments).toHaveLength(1);
    expect(deployments[0].status).toBe("running");
    expect(deployments[0].external_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/i
    );

    const links = await sql<{ deployment_id: string; event_id: string }[]>`
      select deployment_id, event_id from publication_deployment_events
    `;
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link.deployment_id).toBe(deployments[0].id);
    }

    for (const id of [idA, idB]) {
      const state = await eventState(sql, id);
      expect(state.status).toBe("awaiting_deploy");
      expect(state.deployment_id).toBe(deployments[0].id);
    }

    // 指标行：每事件一行 outbox_deliver（dispatched + batched），tick 末一行 outbox_tick
    const deliverMetrics = logLines
      .map((line) => JSON.parse(line) as Record<string, unknown>)
      .filter((line) => line.metric === "outbox_deliver");
    expect(deliverMetrics.map((line) => line.result).sort()).toEqual([
      "batched",
      "dispatched",
    ]);
    const tickMetrics = logLines
      .map((line) => JSON.parse(line) as Record<string, unknown>)
      .filter((line) => line.metric === "outbox_tick");
    expect(tickMetrics).toHaveLength(1);
    expect(tickMetrics[0].awaiting_deploy).toBe(2);

    // 下一个 tick：无 pending 事件，不重复 dispatch
    await tick(deps);
    expect(delivered).toHaveLength(1);
  });

  it("运行中的 deployment 不接收迟到事件，新事件创建新批次", async () => {
    await sql`
      insert into publication_deployments
        (driver, status, external_id, target, started_at)
      values ('github-dispatch', 'running', 'already-running', 'owner/repo', now())
    `;
    const idA = await insertEvent(sql, "late-a");
    const idB = await insertEvent(sql, "late-b");
    const dispatched: string[] = [];
    const deps: TickDeps = {
      sql,
      driver: "github-dispatch",
      deliver: async (_event, options) => {
        dispatched.push(options?.externalId ?? "");
        return {
          outcome: "awaiting_deploy",
          externalId: options?.externalId ?? "",
        };
      },
      target: "owner/repo",
      batchWindowSeconds: 0,
      maxAttempts: 8,
      claimTimeoutSeconds: 60,
      deployTimeoutSeconds: 1800,
    };

    await tick(deps);
    expect(dispatched).toHaveLength(1);
    const deployments = await sql<{ id: string; external_id: string }[]>`
      select id, external_id from publication_deployments order by created_at
    `;
    expect(deployments).toHaveLength(2);
    expect(deployments[1].external_id).toBe(dispatched[0]);
    const linked = await sql<{ event_id: string }[]>`
      select event_id from publication_deployment_events
      where deployment_id = ${deployments[1].id}
    `;
    expect(linked.map((row) => row.event_id).sort()).toEqual([idA, idB].sort());
  });

  it("崩溃遗留的 queued deployment 超租后重排事件并重新 dispatch", async () => {
    const eventId = await insertEvent(sql, "queued-crash");
    const [deployment] = await sql<{ id: string }[]>`
      insert into publication_deployments
        (driver, status, external_id, target, started_at)
      values (
        'github-dispatch', 'queued', 'crashed-batch', 'owner/repo',
        now() - interval '2 minutes'
      )
      returning id
    `;
    await sql`
      insert into publication_deployment_events (deployment_id, event_id)
      values (${deployment.id}, ${eventId})
    `;
    await sql`
      update publication_events
      set status = 'awaiting_deploy', deployment_id = ${deployment.id}
      where id = ${eventId}
    `;
    let dispatches = 0;
    const deps: TickDeps = {
      sql,
      driver: "github-dispatch",
      deliver: async (_event, options) => {
        dispatches += 1;
        return {
          outcome: "awaiting_deploy",
          externalId: options?.externalId ?? "",
        };
      },
      target: "owner/repo",
      batchWindowSeconds: 0,
      maxAttempts: 8,
      claimTimeoutSeconds: 60,
      deployTimeoutSeconds: 1800,
    };

    await tick(deps);
    expect(dispatches).toBe(1);
    const old = await sql<{ status: string }[]>`
      select status from publication_deployments where id = ${deployment.id}
    `;
    expect(old[0].status).toBe("timed_out");
    const state = await eventState(sql, eventId);
    expect(state.status).toBe("awaiting_deploy");
    expect(state.deployment_id).not.toBe(deployment.id);
  });
});
