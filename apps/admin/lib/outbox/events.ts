/**
 * Outbox 事件读取/标记辅助（REL-001/REL-002/REL-004）。
 * 全部走 postgres.js 原生 client；表 publication_events 无 updated_at 列，
 * 认领时把 next_attempt_at 写为认领时刻作为租约起点，
 * reclaimStaleDelivering 据此判断 delivering 是否超租。
 */
import type { PostgresDbHandle } from "@cblog/core/postgres";
import { isExhausted, nextDelayMs } from "./backoff";

export type Sql = PostgresDbHandle["client"];

export interface ClaimedEvent {
  id: string;
  schemaVersion: number;
  entityType: string;
  entityId: string | null;
  operation: string;
  payloadJson: Record<string, unknown>;
  /** 认领后的尝试次数（第 1 次投递为 1） */
  attemptCount: number;
  createdAt: string;
}

interface ClaimedRow {
  id: string;
  schema_version: number;
  entity_type: string;
  entity_id: string | null;
  operation: string;
  payload_json: Record<string, unknown>;
  attempt_count: number;
  /** postgres.js 对 timestamptz 返回 Date；测试 stub 可能给字符串 */
  created_at: Date | string;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toClaimedEvent(row: ClaimedRow): ClaimedEvent {
  return {
    id: row.id,
    schemaVersion: row.schema_version,
    entityType: row.entity_type,
    entityId: row.entity_id,
    operation: row.operation,
    payloadJson: row.payload_json,
    attemptCount: row.attempt_count,
    createdAt: toIsoString(row.created_at),
  };
}

/**
 * 认领一批待投递事件：status=pending 且到点（next_attempt_at 为空或已过），
 * 按 created_at 升序，FOR UPDATE SKIP LOCKED 保证多 worker 不重复领同一事件（REL-004）。
 * 认领即置 delivering、attempt_count+1，并把 next_attempt_at 写为认领时刻（租约起点）。
 */
export async function claimNextBatch(
  sql: Sql,
  limit = 10
): Promise<ClaimedEvent[]> {
  const rows = await sql<ClaimedRow[]>`
    with candidates as (
      select id
      from publication_events
      where status = 'pending'
        and (next_attempt_at is null or next_attempt_at <= now())
      order by created_at asc
      limit ${limit}
      for update skip locked
    )
    update publication_events e
    set status = 'delivering',
        attempt_count = e.attempt_count + 1,
        next_attempt_at = now()
    from candidates c
    where e.id = c.id
    returning e.id, e.schema_version, e.entity_type, e.entity_id,
              e.operation, e.payload_json, e.attempt_count, e.created_at
  `;
  return rows.map(toClaimedEvent);
}

/** 投递成功（runtime 链路）：终态 delivered */
export async function markDelivered(sql: Sql, eventId: string): Promise<void> {
  await sql`
    update publication_events
    set status = 'delivered',
        delivered_at = now(),
        next_attempt_at = null,
        last_error = null
    where id = ${eventId}
  `;
}

/** 已挂到静态部署批次：等待部署 callback 收敛，非终态 */
export async function markAwaitingDeploy(
  sql: Sql,
  eventId: string,
  deploymentId: string
): Promise<void> {
  await sql`
    update publication_events
    set status = 'awaiting_deploy',
        deployment_id = ${deploymentId},
        next_attempt_at = null,
        last_error = null
    where id = ${eventId}
  `;
}

/** 终态 failed（耗尽或不可重试），等待发布页 retry 复位 */
export async function markFailed(
  sql: Sql,
  eventId: string,
  errorMessage: string
): Promise<void> {
  await sql`
    update publication_events
    set status = 'failed',
        last_error = ${errorMessage},
        next_attempt_at = null
    where id = ${eventId}
  `;
}

/**
 * 投递失败：按退避序列推迟下次尝试；attempt 耗尽则转 failed。
 * 返回本次落定的走向，供 worker 输出指标。
 */
export async function markRetryLater(
  sql: Sql,
  eventId: string,
  errorMessage: string,
  maxAttempts: number
): Promise<"retry" | "failed"> {
  const rows = await sql<{ attempt_count: number }[]>`
    select attempt_count from publication_events where id = ${eventId}
  `;
  if (rows.length === 0) {
    throw new Error(`publication_event 不存在: ${eventId}`);
  }
  const attempt = rows[0].attempt_count;
  if (isExhausted(attempt, maxAttempts)) {
    await markFailed(sql, eventId, errorMessage);
    return "failed";
  }
  const delayMs = nextDelayMs(attempt);
  await sql`
    update publication_events
    set status = 'pending',
        last_error = ${errorMessage},
        next_attempt_at = now() + (${delayMs} * interval '1 millisecond')
    where id = ${eventId}
  `;
  return "retry";
}

/**
 * 回收超租的 delivering：worker 崩溃/卡死后事件回到 pending，
 * attempt_count 不增（本次认领不算一次投递尝试）。
 */
export async function reclaimStaleDelivering(
  sql: Sql,
  claimTimeoutSeconds: number
): Promise<number> {
  const rows = await sql<{ id: string }[]>`
    update publication_events
    set status = 'pending',
        next_attempt_at = null
    where status = 'delivering'
      and next_attempt_at is not null
      and next_attempt_at <= now() - (${claimTimeoutSeconds} * interval '1 second')
    returning id
  `;
  return rows.length;
}

/**
 * failed 事件人工重投复位（配合发布页 retry API）：
 * 回 pending、attempt 清零、清空错误与退避/部署关联。
 */
export async function resetFailedForRetry(
  sql: Sql,
  eventId: string
): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    update publication_events
    set status = 'pending',
        attempt_count = 0,
        next_attempt_at = null,
        last_error = null,
        deployment_id = null
    where id = ${eventId} and status = 'failed'
    returning id
  `;
  return rows.length > 0;
}

export interface OutboxCounts {
  pending: number;
  delivering: number;
  awaiting_deploy: number;
  failed: number;
  delivered_total: number;
  oldest_pending_age_seconds: number;
}

export async function countByStatus(sql: Sql): Promise<OutboxCounts> {
  const rows = await sql<{ status: string; count: string }[]>`
    select status, count(*)::text as count
    from publication_events
    group by status
  `;
  const oldestRows = await sql<{ age_seconds: string }[]>`
    select coalesce(
      extract(
        epoch from (
          now() - (min(created_at) filter (where status = 'pending'))
        )
      ),
      0
    )::text as age_seconds
    from publication_events
  `;
  const counts: OutboxCounts = {
    pending: 0,
    delivering: 0,
    awaiting_deploy: 0,
    failed: 0,
    delivered_total: 0,
    oldest_pending_age_seconds: Number(oldestRows[0]?.age_seconds ?? 0),
  };
  for (const row of rows) {
    const value = Number(row.count);
    if (row.status === "delivered") counts.delivered_total = value;
    else if (row.status in counts) {
      counts[row.status as "pending" | "delivering" | "awaiting_deploy" | "failed"] =
        value;
    }
  }
  return counts;
}
