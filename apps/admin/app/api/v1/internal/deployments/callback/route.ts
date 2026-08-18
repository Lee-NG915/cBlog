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
    const existing = await sql<
      { id: string; status: string; finished_at: string | null }[]
    >`select id, status, finished_at from publication_deployments where external_id = ${body.batchId} limit 1`;

    if (existing.length > 0) {
      const row = existing[0];
      const sameReport =
        row.status === body.status &&
        row.finished_at !== null &&
        Date.parse(row.finished_at) === new Date(body.reportedAt).getTime();
      // 同批次重发：不重复插入（STATIC-006）；内容有变化时原位更新，完全重放则不写库
      if (!sameReport) {
        await sql`
          update publication_deployments
          set status = ${body.status},
              finished_at = ${body.reportedAt},
              last_error = ${body.detail ?? null},
              updated_at = now()
          where id = ${row.id}
        `;
      }
      return { ok: true, idempotent: true };
    }

    try {
      await sql`
        insert into publication_deployments
          (driver, status, external_id, target, finished_at, last_error)
        values
          (${driver}, ${body.status}, ${body.batchId},
           ${process.env.GITHUB_REPOSITORY?.trim() || driver},
           ${body.reportedAt}, ${body.detail ?? null})
      `;
      return { ok: true, idempotent: false };
    } catch (error) {
      // 并发双写同 batchId：撞 external_id 唯一索引即收敛为幂等成功（STATIC-006）
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        return { ok: true, idempotent: true };
      }
      throw error;
    }
  });
}
