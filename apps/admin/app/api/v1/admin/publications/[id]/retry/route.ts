import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleV1, requireMutationContext } from "@/lib/api-guards";
import { pgHandle } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * 手动重试（REL-005 / STATIC-005 恢复路径）：
 * - 默认重试单个事件：仅 failed 可复位为 pending（attemptCount/nextAttemptAt/lastError 清零）；
 * - body 带 { deploymentId } 时重试整个失败部署：其关联的 failed 事件全部复位，
 *   旧 deployment 保持 failed 审计终态，worker 为重试事件创建新批次并重新 dispatch。
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readDeploymentId(request: NextRequest): Promise<
  string | undefined
> {
  const raw = await request.text();
  if (!raw.trim()) return undefined;
  const data: unknown = JSON.parse(raw); // SyntaxError 由 handleV1 映射 400
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ApiError(400, "BAD_REQUEST", "请求体必须是 JSON 对象");
  }
  const body = data as Record<string, unknown>;
  if (body.deploymentId === undefined) return undefined;
  if (
    typeof body.deploymentId !== "string" ||
    !UUID_PATTERN.test(body.deploymentId)
  ) {
    throw new ApiError(400, "BAD_REQUEST", "deploymentId 必须是 UUID 字符串");
  }
  return body.deploymentId;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const deploymentId = await readDeploymentId(request);
    const sql = pgHandle().client;

    if (deploymentId) {
      return await sql.begin(async (tx) => {
        const deployments = await tx<{ id: string; status: string }[]>`
          select id, status from publication_deployments where id = ${deploymentId} limit 1
        `;
        if (deployments.length === 0) {
          throw new ApiError(404, "NOT_FOUND", "部署批次不存在");
        }
        if (deployments[0].status !== "failed") {
          throw new ApiError(409, "DEPLOYMENT_NOT_FAILED", "仅失败的部署批次可重试");
        }
        const reset = await tx<{ id: string }[]>`
          update publication_events
          set status = 'pending', attempt_count = 0,
              next_attempt_at = null, last_error = null,
              deployment_id = null
          where status = 'failed'
            and id in (
              select event_id from publication_deployment_events
              where deployment_id = ${deploymentId}
            )
          returning id
        `;
        if (reset.length === 0) {
          throw new ApiError(
            409,
            "EVENT_NOT_FAILED",
            "该部署没有失败的关联事件"
          );
        }
        return { ok: true, retried: reset.length, deploymentId };
      });
    }

    if (!UUID_PATTERN.test(params.id)) {
      throw new ApiError(404, "NOT_FOUND", "发布事件不存在");
    }
    const existing = await sql<{ status: string }[]>`
      select status from publication_events where id = ${params.id} limit 1
    `;
    if (existing.length === 0) {
      throw new ApiError(404, "NOT_FOUND", "发布事件不存在");
    }
    if (existing[0].status !== "failed") {
      throw new ApiError(409, "EVENT_NOT_FAILED", "仅失败的发布事件可重试");
    }
    await sql`
      update publication_events
      set status = 'pending', attempt_count = 0,
          next_attempt_at = null, last_error = null,
          deployment_id = null
      where id = ${params.id} and status = 'failed'
    `;
    return { ok: true, retried: 1 };
  });
}
