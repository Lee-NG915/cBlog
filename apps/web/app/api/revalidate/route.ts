/**
 * POST /api/revalidate — Content API Outbox worker 的 revalidation webhook。
 *
 * - 仅 runtime-isr profile 可用（WEB_RENDER_MODE=runtime-isr），否则 404；
 *   static-export 构建下该 POST-only handler 不产出 out/api（已实证）。
 * - 验签：HMAC-SHA256 覆盖 "<timestamp>.<keyId>.<rawBody>"，时间窗 ±300s，
 *   轮换期接受 REVALIDATION_ACTIVE/PREVIOUS 两对 keyId+secret，常量时间比较。
 * - 幂等：X-CBlog-Event-Id 进程内 24h 记录，重复事件直接 200 idempotent。
 * - 只接受领域事件，tag/path 由 planRevalidation 集中映射，防止任意 purge。
 *
 * 注意：不要加 `export const dynamic = "force-dynamic"`，会让 output:"export" 构建失败。
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { IdempotencyStore } from "@/lib/revalidate/idempotency";
import { parseRevalidateEvent, planRevalidation } from "@/lib/revalidate/plan";
import {
  isTimestampFresh,
  parseTimestampHeader,
  resolveSecret,
  verifySignature,
} from "@/lib/revalidate/signature";

const EVENT_ID_MAX_LENGTH = 128;

// 模块级单例：route handler 在同一进程内复用
const idempotencyStore = new IdempotencyStore();

function json(status: number, body: Record<string, unknown>): NextResponse {
  return NextResponse.json(body, { status });
}

/** 401 同构响应：不区分缺头/时间窗/未知 keyId/验签失败，避免泄露细节 */
function unauthorized(): NextResponse {
  return json(401, { ok: false, error: "unauthorized" });
}

function logRevalidateRequest(entry: {
  eventId: string;
  entityType?: string;
  result: string;
}): void {
  // revalidate_requests_total 语义的结构化日志（一行 JSON，由采集侧聚合计数）
  console.log(
    JSON.stringify({ metric: "revalidate_requests_total", ...entry })
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.WEB_RENDER_MODE !== "runtime-isr") {
    return json(404, { ok: false, error: "not_found" });
  }

  const activeKeyId = process.env.REVALIDATION_ACTIVE_KEY_ID;
  const active = process.env.REVALIDATION_ACTIVE_SECRET;
  if (!activeKeyId || !active) {
    // 密钥未配置：route 全部 503，不处理任何请求
    return json(503, { ok: false, error: "revalidation_unavailable" });
  }
  const secrets = {
    activeKeyId,
    active,
    previousKeyId: process.env.REVALIDATION_PREVIOUS_KEY_ID,
    previous: process.env.REVALIDATION_PREVIOUS_SECRET,
  };

  const rawBody = await request.text();
  const eventId = request.headers.get("x-cblog-event-id");
  const timestampHeader = request.headers.get("x-cblog-timestamp");
  const keyId = request.headers.get("x-cblog-key-id");
  const signature = request.headers.get("x-cblog-signature");

  if (
    !eventId ||
    eventId.length > EVENT_ID_MAX_LENGTH ||
    !timestampHeader ||
    !keyId ||
    !signature
  ) {
    return unauthorized();
  }

  const timestamp = parseTimestampHeader(timestampHeader);
  if (
    timestamp === null ||
    !isTimestampFresh(timestamp, Math.floor(Date.now() / 1000))
  ) {
    return unauthorized();
  }

  const secret = resolveSecret(secrets, keyId);
  if (!secret) {
    return unauthorized();
  }

  if (
    !verifySignature({
      secret,
      timestamp: timestampHeader,
      keyId,
      rawBody,
      provided: signature,
    })
  ) {
    return unauthorized();
  }

  if (idempotencyStore.isDuplicate(eventId)) {
    logRevalidateRequest({ eventId, result: "idempotent" });
    return json(200, { ok: true, idempotent: true });
  }

  let event;
  try {
    event = parseRevalidateEvent(JSON.parse(rawBody));
  } catch {
    // 响应不泄露校验细节；明细只进日志
    logRevalidateRequest({ eventId, result: "bad_request" });
    return json(400, { ok: false, error: "invalid_event" });
  }

  const plan = planRevalidation(event);
  for (const tag of plan.tags) {
    revalidateTag(tag);
  }
  for (const path of plan.paths) {
    revalidatePath(path);
  }
  if (plan.layoutRefresh) {
    revalidatePath("/", "layout");
  }

  // 只在成功执行后记录 eventId：schema 错误（400）不烧掉幂等键，允许修复后重投
  idempotencyStore.record(eventId);
  logRevalidateRequest({
    eventId,
    entityType: event.entityType,
    result: "revalidated",
  });

  return json(200, { ok: true, revalidated: plan });
}
