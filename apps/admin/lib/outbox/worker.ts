/**
 * Outbox worker 主循环（REL-001/002/004、STATIC-005/006）。
 *
 * 每个 tick 的状态机：
 * 1. reclaimStaleDelivering：回收超租的 delivering（worker 崩溃恢复，attempt 不增）；
 * 2. 部署巡检：running 超过 OUTBOX_DEPLOY_TIMEOUT_SECONDS → timed_out，
 *    关联的 awaiting_deploy 事件回 pending（attempt 不增，等下一轮重投）；
 * 3. claimNextBatch：FOR UPDATE SKIP LOCKED 认领（置 delivering、attempt+1）；
 * 4. 逐事件投递：
 *    - revalidation-webhook：deliver 成功 → delivered（终态）；
 *    - static 驱动合批：从最老 pending 事件起等待 debounce 窗口，一次 claim
 *      当前批次；先持久化 queued deployment/externalId/事件关联，再 dispatch；
 *      已触发的 running deployment 不再接收新事件，避免旧 artifact 误报新事件上线；
 *      deliver 失败时 deployment 留作审计，事件走退避；
 *    - deliver throw → markRetryLater（耗尽 → failed + last_error）；
 * 5. 每事件一行 outbox_deliver 指标，tick 末一行 outbox_tick 指标（counts 查询）。
 */
import { randomUUID } from "node:crypto";
import { closePostgresDb, createPostgresDb } from "@cblog/core/postgres";
import {
  githubRepository,
  outboxBatchWindowSeconds,
  outboxClaimTimeoutSeconds,
  outboxDeployTimeoutSeconds,
  outboxMaxAttempts,
  outboxPollIntervalMs,
  outboxRequestTimeoutMs,
  publicationDriver,
  requireDatabaseUrl,
  type PublicationDriver,
} from "../env";
import { isBatchReady } from "./batch";
import { createDeliverFn, type DeliverFn } from "./drivers";
import {
  claimNextBatch,
  countByStatus,
  markDelivered,
  markRetryLater,
  reclaimStaleDelivering,
  type ClaimedEvent,
  type Sql,
} from "./events";

export interface TickDeps {
  sql: Sql;
  driver: PublicationDriver;
  deliver: DeliverFn;
  /** publication_deployments.target（github-dispatch 为仓库名，否则为 driver 名） */
  target: string;
  batchWindowSeconds: number;
  maxAttempts: number;
  claimTimeoutSeconds: number;
  deployTimeoutSeconds: number;
  batchLimit?: number;
  log?: (line: string) => void;
}

type DeliverResult =
  | "delivered"
  | "batched"
  | "dispatched"
  | "unknown"
  | "retry"
  | "failed";

function isDefinitiveStaticFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("触发失败：HTTP") ||
    error.message.startsWith("static 驱动未返回")
  );
}

/**
 * 同一 claim 批次的 static 事件先持久化为一个 queued deployment，再触发一次构建。
 * running deployment 绝不继续合批：构建可能已读取数据，迟到事件不能被旧 callback
 * 误报为已上线。externalId 在外部请求前落库，使 queued 崩溃现场可被巡检恢复。
 */
async function deliverStaticBatch(
  deps: TickDeps,
  events: ClaimedEvent[]
): Promise<Map<string, DeliverResult>> {
  const results = new Map<string, DeliverResult>();
  if (events.length === 0) return results;

  const externalId = randomUUID();
  const deploymentId = await deps.sql.begin(async (tx) => {
    const [deployment] = await tx<{ id: string }[]>`
      insert into publication_deployments
        (driver, status, external_id, target, attempt_count, started_at)
      values (${deps.driver}, 'queued', ${externalId}, ${deps.target}, 1, now())
      returning id
    `;
    for (const event of events) {
      await tx`
        insert into publication_deployment_events (deployment_id, event_id)
        values (${deployment.id}, ${event.id})
        on conflict do nothing
      `;
      await tx`
        update publication_events
        set status = 'awaiting_deploy',
            deployment_id = ${deployment.id},
            next_attempt_at = null,
            last_error = null
        where id = ${event.id} and status = 'delivering'
      `;
    }
    return deployment.id;
  });

  try {
    const outcome = await deps.deliver(events[0], { externalId });
    if (
      outcome.outcome !== "awaiting_deploy" ||
      outcome.externalId !== externalId
    ) {
      throw new Error("static 驱动未返回 worker 指定的 externalId");
    }
    // 快速 callback 可能已经把 queued 收敛为终态，不能再回退为 running。
    await deps.sql`
      update publication_deployments
      set status = 'running', updated_at = now()
      where id = ${deploymentId} and status = 'queued'
    `;
    events.forEach((event, index) => {
      results.set(event.id, index === 0 ? "dispatched" : "batched");
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isDefinitiveStaticFailure(error)) {
      // 网络错误/超时无法证明外部没有接受请求。保持 queued + awaiting_deploy，
      // 让迟到 callback 优先收敛；超过 queued 租约后巡检再安全重排。
      events.forEach((event) => results.set(event.id, "unknown"));
      return results;
    }
    // 抢先把仍属于本批次的 awaiting 事件移回 delivering，阻止迟到 callback
    // 与失败退避并发改写；已经被 callback 收敛的终态事件不会被触碰。
    const retryable = await deps.sql.begin(async (tx) => {
      await tx`
        update publication_deployments
        set status = 'failed', finished_at = now(),
            last_error = ${message}, updated_at = now()
        where id = ${deploymentId} and status = 'queued'
      `;
      return tx<{ id: string }[]>`
        update publication_events
        set status = 'delivering'
        where deployment_id = ${deploymentId}
          and status = 'awaiting_deploy'
        returning id
      `;
    });
    for (const { id } of retryable) {
      results.set(
        id,
        await markRetryLater(deps.sql, id, message, deps.maxAttempts)
      );
    }
    for (const event of events) {
      if (!results.has(event.id)) results.set(event.id, "delivered");
    }
  }
  return results;
}

async function deliverEvent(
  deps: TickDeps,
  event: ClaimedEvent
): Promise<DeliverResult> {
  try {
    if (deps.driver === "revalidation-webhook") {
      await deps.deliver(event);
      if (process.env.WORKER_CRASH_AFTER_RESPONSE === "1") {
        // 仅供 REL-003 故障演练：模拟下游已 2xx、delivered 尚未落库时进程崩溃。
        process.exit(86);
      }
      await markDelivered(deps.sql, event.id);
      return "delivered";
    }
    throw new Error("static 事件必须由 deliverStaticBatch 合批处理");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return markRetryLater(deps.sql, event.id, message, deps.maxAttempts);
  }
}

/** queued/running 超时的 deployment 置 timed_out，关联 awaiting_deploy 事件回 pending */
async function patrolStaleDeployments(deps: TickDeps): Promise<number> {
  const rows = await deps.sql<{ event_id: string }[]>`
    with stale as (
      update publication_deployments
      set status = 'timed_out',
          finished_at = now(),
          last_error = coalesce(last_error, 'deploy timeout'),
          updated_at = now()
      where started_at is not null
        and (
          (
            status = 'queued'
            and started_at <= now() - (${deps.claimTimeoutSeconds} * interval '1 second')
          )
          or
          (
            status = 'running'
            and started_at <= now() - (${deps.deployTimeoutSeconds} * interval '1 second')
          )
        )
      returning id
    )
    update publication_events e
    set status = 'pending',
        next_attempt_at = null,
        deployment_id = null,
        last_error = 'deployment timed out'
    from stale s
    where e.deployment_id = s.id
      and e.status = 'awaiting_deploy'
    returning e.id as event_id
  `;
  return rows.length;
}

export async function tick(deps: TickDeps): Promise<void> {
  const log = deps.log ?? ((line: string) => console.log(line));

  await reclaimStaleDelivering(deps.sql, deps.claimTimeoutSeconds);
  const timedOut = await patrolStaleDeployments(deps);
  if (timedOut > 0) {
    log(JSON.stringify({ metric: "outbox_deploy_timed_out", events: timedOut }));
  }

  if (deps.driver !== "revalidation-webhook" && deps.batchWindowSeconds > 0) {
    const oldest = await deps.sql<{ created_at: Date | string }[]>`
      select created_at
      from publication_events
      where status = 'pending'
        and (next_attempt_at is null or next_attempt_at <= now())
      order by created_at asc
      limit 1
    `;
    if (oldest.length > 0) {
      const createdAt =
        oldest[0].created_at instanceof Date
          ? oldest[0].created_at
          : new Date(oldest[0].created_at);
      if (!isBatchReady(createdAt, new Date(), deps.batchWindowSeconds)) {
        const counts = await countByStatus(deps.sql);
        log(
          JSON.stringify({
            metric: "outbox_tick",
            ...counts,
            static_batch_waiting: true,
          })
        );
        return;
      }
    }
  }

  const batch = await claimNextBatch(deps.sql, deps.batchLimit ?? 10);
  const staticResults =
    deps.driver === "revalidation-webhook"
      ? null
      : await deliverStaticBatch(deps, batch);
  for (const [index, event] of batch.entries()) {
    const startedAt = Date.now();
    const result =
      staticResults?.get(event.id) ?? (await deliverEvent(deps, event));
    log(
      JSON.stringify({
        metric: "outbox_deliver",
        eventId: event.id,
        entityType: event.entityType,
        result,
        attempt: event.attemptCount,
        elapsedMs: Date.now() - startedAt,
        batchIndex: staticResults ? index : undefined,
      })
    );
  }

  const counts = await countByStatus(deps.sql);
  log(JSON.stringify({ metric: "outbox_tick", ...counts }));
}

function buildTickDeps(): TickDeps & { handleClose: () => Promise<void> } {
  const driver = publicationDriver();
  const claimTimeoutSeconds = outboxClaimTimeoutSeconds();
  const requestTimeoutMs = outboxRequestTimeoutMs();
  if (requestTimeoutMs >= claimTimeoutSeconds * 1000) {
    throw new Error(
      "OUTBOX_REQUEST_TIMEOUT_MS 必须小于 OUTBOX_CLAIM_TIMEOUT_SECONDS 对应毫秒数"
    );
  }
  const handle = createPostgresDb(requireDatabaseUrl(), { max: 4 });
  return {
    sql: handle.client,
    driver,
    deliver: createDeliverFn(driver),
    target:
      driver === "github-dispatch" ? githubRepository() ?? driver : driver,
    batchWindowSeconds: outboxBatchWindowSeconds(),
    maxAttempts: outboxMaxAttempts(),
    claimTimeoutSeconds,
    deployTimeoutSeconds: outboxDeployTimeoutSeconds(),
    handleClose: () => closePostgresDb(handle),
  };
}

export interface RunWorkerOptions {
  /** once=true 跑一个 tick 后退出（测试/手动触发用） */
  once?: boolean;
  log?: (line: string) => void;
}

export async function runWorker(options: RunWorkerOptions = {}): Promise<void> {
  const log = options.log ?? ((line: string) => console.log(line));
  const deps = buildTickDeps();

  if (options.once) {
    try {
      await tick({ ...deps, log });
    } finally {
      await deps.handleClose();
    }
    return;
  }

  const pollIntervalMs = outboxPollIntervalMs();
  log(
    JSON.stringify({
      metric: "outbox_worker_start",
      driver: deps.driver,
      pollIntervalMs,
    })
  );

  await new Promise<void>((resolve) => {
    let inFlight: Promise<void> | null = null;
    const timer = setInterval(() => {
      if (inFlight) return; // 上一 tick 未结束则跳过，绝不并发 tick
      inFlight = tick({ ...deps, log })
        .catch((error) => {
          log(
            JSON.stringify({
              metric: "outbox_tick_error",
              error: error instanceof Error ? error.message : String(error),
            })
          );
        })
        .finally(() => {
          inFlight = null;
        });
    }, pollIntervalMs);

    const shutdown = (signal: string) => {
      clearInterval(timer);
      log(JSON.stringify({ metric: "outbox_worker_stop", signal }));
      // 等在途 tick 完成后关闭连接池，优雅退出
      void (inFlight ?? Promise.resolve()).then(async () => {
        await deps.handleClose();
        resolve();
      });
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  });
}
