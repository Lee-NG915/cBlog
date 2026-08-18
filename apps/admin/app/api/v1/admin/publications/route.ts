import { handleV1 } from "@/lib/api-guards";
import { publicationDriver } from "@/lib/env";
import { pgHandle } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * 发布动态（Outbox 事件流）只读视图（Phase 6）。
 * 与 /api/v1/admin/posts 的 GET 一致：不加 requireMutationContext——
 * middleware 已对 /api/v1/admin/** 做会话 + allowlist 复核（AUTH-001/002）。
 */
const EVENT_LIST_LIMIT = 50;
const BACKLOG_PENDING_THRESHOLD = 5;
const BACKLOG_AGE_THRESHOLD_MS = 5 * 60 * 1000;

interface EventRow {
  id: string;
  entity_type: string;
  operation: string;
  payload_json: Record<string, unknown>;
  status: string;
  attempt_count: number;
  last_error: string | null;
  deployment_id: string | null;
  delivered_at: string | null;
  created_at: string;
  next_attempt_at: string | null;
}

export async function GET() {
  return handleV1(async () => {
    const sql = pgHandle().client;

    const rows = await sql<EventRow[]>`
      select id, entity_type, operation, payload_json, status, attempt_count,
             last_error, deployment_id, delivered_at, created_at, next_attempt_at
      from publication_events
      order by created_at desc
      limit ${EVENT_LIST_LIMIT}
    `;

    const countRows = await sql<{ status: string; count: number }[]>`
      select status, count(*)::int as count
      from publication_events
      group by status
    `;
    const oldestPendingRows = await sql<{ oldest: string | null }[]>`
      select min(created_at) as oldest
      from publication_events
      where status = 'pending'
    `;

    const counts: Record<string, number> = {
      pending: 0,
      delivering: 0,
      awaiting_deploy: 0,
      delivered: 0,
      failed: 0,
    };
    for (const row of countRows) {
      counts[row.status] = row.count;
    }
    const oldestPendingAt = oldestPendingRows[0]?.oldest ?? null;
    const backlogWarning =
      counts.pending > BACKLOG_PENDING_THRESHOLD ||
      (oldestPendingAt !== null &&
        Date.now() - new Date(oldestPendingAt).getTime() >
          BACKLOG_AGE_THRESHOLD_MS);

    console.info(
      JSON.stringify({
        metric: "publication_events_view",
        eventIds: rows.map((row) => row.id),
        pending: counts.pending,
        oldestPendingAt,
        backlogWarning,
      })
    );

    return {
      events: rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        operation: row.operation,
        payloadJson: row.payload_json,
        status: row.status,
        attemptCount: row.attempt_count,
        lastError: row.last_error,
        deploymentId: row.deployment_id,
        deliveredAt: row.delivered_at,
        createdAt: row.created_at,
        nextAttemptAt: row.next_attempt_at,
      })),
      stats: { counts, oldestPendingAt, backlogWarning },
      driver: publicationDriver(),
    };
  });
}
