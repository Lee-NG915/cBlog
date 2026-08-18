import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { ApiError, handleV1 } from "@/lib/api-guards";
import { deployCallbackSecret, publicationDriver } from "@/lib/env";
import { pgHandle } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * 部署结果 callback（STATIC-006 接收端，技术设计 §6/§7.3）。
 * 机器调用：middleware 对 /api/v1/internal/** 放行匿名请求，鉴权全部在这里完成——
 * HMAC-SHA256 签名覆盖 `<X-CBlog-Timestamp>.<rawBody>`，头 `X-CBlog-Signature: sha256=<hex>`，
 * 时间戳偏差超过 300s 视为重放拒绝。
 * 幂等键：publication_deployments.external_id（驱动侧批次标识，唯一索引兜底并发）。
 */
const MAX_CLOCK_SKEW_SECONDS = 300;

interface CallbackBody {
  batchId: string;
  status: "succeeded" | "failed";
  reportedAt: string;
  detail?: string;
}

function parseCallbackBody(rawBody: string): CallbackBody {
  const data: unknown = JSON.parse(rawBody); // SyntaxError 由 handleV1 映射 400
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ApiError(400, "BAD_REQUEST", "请求体必须是 JSON 对象");
  }
  const body = data as Record<string, unknown>;
  if (
    typeof body.batchId !== "string" ||
    body.batchId.length < 1 ||
    body.batchId.length > 128
  ) {
    throw new ApiError(400, "BAD_REQUEST", "batchId 必须是 1..128 字符的字符串");
  }
  if (body.status !== "succeeded" && body.status !== "failed") {
    throw new ApiError(400, "BAD_REQUEST", "status 只接受 succeeded|failed");
  }
  if (
    typeof body.reportedAt !== "string" ||
    Number.isNaN(Date.parse(body.reportedAt))
  ) {
    throw new ApiError(400, "BAD_REQUEST", "reportedAt 必须是 ISO 时间字符串");
  }
  if (
    body.detail !== undefined &&
    (typeof body.detail !== "string" || body.detail.length > 2000)
  ) {
    throw new ApiError(400, "BAD_REQUEST", "detail 必须是不超过 2000 字符的字符串");
  }
  return {
    batchId: body.batchId,
    status: body.status,
    reportedAt: body.reportedAt,
    detail: body.detail as string | undefined,
  };
}

function verifySignature(
  request: NextRequest,
  secret: string,
  rawBody: string
): void {
  const timestamp = request.headers.get("x-cblog-timestamp") ?? "";
  const signature = request.headers.get("x-cblog-signature") ?? "";
  const seconds = Number(timestamp);
  if (
    !timestamp ||
    !Number.isInteger(seconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - seconds) > MAX_CLOCK_SKEW_SECONDS
  ) {
    throw new ApiError(401, "UNAUTHENTICATED", "缺少或过期的时间戳");
  }
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const provided = signature.startsWith("sha256=") ? signature.slice(7) : "";
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    throw new ApiError(401, "UNAUTHENTICATED", "签名无效");
  }
}

export async function POST(request: NextRequest) {
  return handleV1(async () => {
    const secret = deployCallbackSecret();
    if (!secret) {
      throw new ApiError(
        503,
        "CALLBACK_NOT_CONFIGURED",
        "部署 callback 未配置（缺少 DEPLOY_CALLBACK_SECRET）"
      );
    }
    const rawBody = await request.text();
    verifySignature(request, secret, rawBody);
    const body = parseCallbackBody(rawBody);

    // driver 列枚举只覆盖 static 驱动；revalidation-webhook 属 runtime 链路，无静态部署 callback
    const driver = publicationDriver();
    if (driver === "revalidation-webhook") {
      throw new ApiError(
        409,
        "DRIVER_NOT_STATIC",
        "revalidation-webhook 模式不接受静态部署 callback"
      );
    }

    const sql = pgHandle().client;
    // 幂等 upsert 与事件联动在同一事务内（STATIC-005/006）：
    // 联动只迁移仍处于 awaiting_deploy 的关联事件，重复 callback 命中 0 行、零副作用
    return await sql.begin(async (tx) => {
      const existing = await tx<
        { id: string; status: string; finished_at: string | null }[]
      >`
        select id, status, finished_at
        from publication_deployments
        where external_id = ${body.batchId}
        limit 1
        for update
      `;

      let deploymentId: string;
      let idempotent: boolean;
      let effectiveStatus: "succeeded" | "failed";
      if (existing.length > 0) {
        const row = existing[0];
        const terminal =
          (row.status === "succeeded" || row.status === "failed") &&
          row.finished_at !== null;
        // 同一部署采用 first-terminal-wins：重复、迟到或冲突 callback 都不能
        // 让终态回退/翻转；部署平台如需重跑必须创建新的 batchId。
        if (!terminal) {
          await tx`
            update publication_deployments
            set status = ${body.status},
                finished_at = ${body.reportedAt},
                last_error = ${body.detail ?? null},
                updated_at = now()
            where id = ${row.id}
          `;
        }
        deploymentId = row.id;
        idempotent = true;
        effectiveStatus = terminal
          ? (row.status as "succeeded" | "failed")
          : body.status;
      } else {
        // on conflict do nothing：并发双写同 batchId 撞 external_id 唯一索引时
        // 事务保持有效，回读已存在的行收敛为幂等成功（STATIC-006）
        const inserted = await tx<{ id: string }[]>`
          insert into publication_deployments
            (driver, status, external_id, target, finished_at, last_error)
          values
            (${driver}, ${body.status}, ${body.batchId},
             ${process.env.GITHUB_REPOSITORY?.trim() || driver},
             ${body.reportedAt}, ${body.detail ?? null})
          on conflict (external_id) do nothing
          returning id
        `;
        if (inserted.length > 0) {
          deploymentId = inserted[0].id;
          idempotent = false;
          effectiveStatus = body.status;
        } else {
          const raced = await tx<{ id: string; status: string }[]>`
            select id, status from publication_deployments where external_id = ${body.batchId} limit 1
          `;
          deploymentId = raced[0].id;
          idempotent = true;
          effectiveStatus = raced[0].status as "succeeded" | "failed";
        }
      }

      // 事件联动：succeeded → 关联 awaiting_deploy 事件置 delivered 并回写 deployment_id；
      // failed → 关联 awaiting_deploy 事件置 failed（last_error=detail）
      const linked =
        effectiveStatus === "succeeded"
          ? await tx<{ id: string }[]>`
              update publication_events
              set status = 'delivered',
                  delivered_at = ${body.reportedAt},
                  deployment_id = ${deploymentId}
              where status = 'awaiting_deploy'
                and deployment_id = ${deploymentId}
                and id in (
                  select event_id from publication_deployment_events
                  where deployment_id = ${deploymentId}
                )
              returning id
            `
          : await tx<{ id: string }[]>`
              update publication_events
              set status = 'failed',
                  last_error = ${body.detail ?? null}
              where status = 'awaiting_deploy'
                and deployment_id = ${deploymentId}
                and id in (
                  select event_id from publication_deployment_events
                  where deployment_id = ${deploymentId}
                )
              returning id
            `;

      return { ok: true, idempotent, linkedEvents: linked.length };
    });
  });
}
