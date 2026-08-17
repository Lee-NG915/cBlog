import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/auth";
import { contentApiReadToken, publicContentApiEnabled } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string = randomUUID()
): NextResponse {
  return NextResponse.json(
    { error: { code, message, requestId } },
    { status, headers: { "Cache-Control": "private, no-store" } }
  );
}

/** 统一 v1 错误封装：领域错误映射稳定错误码，避免泄漏 SQL/堆栈（API-010） */
export async function handleV1<T>(
  fn: () => T | Promise<T>
): Promise<NextResponse> {
  const requestId = randomUUID();
  try {
    const data = await fn();
    if (data instanceof NextResponse) return data;
    return NextResponse.json((data ?? { ok: true }) as object);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error.status, error.code, error.message, requestId);
    }
    // 用实例 name（领域错误类显式赋值），不用 constructor.name——生产构建压缩后类名会被改写
    const name = error instanceof Error ? error.name : "";
    if (name === "VersionConflictError") {
      return errorResponse(
        409,
        "VERSION_CONFLICT",
        (error as Error).message,
        requestId
      );
    }
    if (name === "ContentNotFoundError") {
      return errorResponse(404, "NOT_FOUND", "内容不存在", requestId);
    }
    if (name === "InvalidContentStatusTransitionError") {
      // message 为固定格式（current -> next），不含内部细节
      return errorResponse(
        400,
        "INVALID_STATUS_TRANSITION",
        (error as Error).message,
        requestId
      );
    }
    if (error instanceof SyntaxError) {
      // request.json() 对畸形 body 抛 SyntaxError，属客户端错误
      return errorResponse(400, "BAD_REQUEST", "请求体不是合法 JSON", requestId);
    }
    // 本代码库的业务校验错误均为字面量 message 的 Error 基类实例，原样返回 400；
    // 其余子类/驱动错误（PostgresError、TypeError 等）统一 500 固定文案，不外抛内部细节（API-010）
    if (error instanceof Error && error.constructor === Error) {
      return errorResponse(400, "BAD_REQUEST", error.message, requestId);
    }
    console.error(`[api:${requestId}]`, error);
    return errorResponse(500, "INTERNAL_ERROR", "服务器错误", requestId);
  }
}

/** 管理写接口三重守卫：会话 + Origin 校验 + 频率限制（AUTH-003/004、SEC-008） */
export async function requireMutationContext(
  request: NextRequest
): Promise<{ actorId: string } | NextResponse> {
  const session = await requireAdminSession();
  const githubId = (session?.user as { githubId?: string } | undefined)
    ?.githubId;
  if (!session || !githubId) {
    return errorResponse(401, "UNAUTHENTICATED", "未登录或会话已过期");
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const requestHost = request.headers.get("host");
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
    if (!originHost || !requestHost || originHost !== requestHost) {
      return errorResponse(403, "CSRF_ORIGIN_MISMATCH", "跨源写请求被拒绝");
    }
  }

  if (!consumeRateLimit(`mutation:${githubId}`)) {
    return errorResponse(429, "RATE_LIMITED", "写操作过于频繁，请稍后重试");
  }

  return { actorId: githubId };
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const rateBuckets = new Map<string, { windowStart: number; count: number }>();

export function consumeRateLimit(
  key: string,
  max: number = RATE_LIMIT_MAX
): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/**
 * 公开只读 API 守卫（§7.1）：
 * - flag 关闭时统一 404（不暴露存在性）；
 * - 配置了 read token 时要求 Bearer 且常量时间比较（API-005）；
 * - 响应统一 no-store，让 Web 的 Next Data Cache 成为唯一可编程缓存层。
 */
export function guardPublicApi(request: NextRequest): NextResponse | null {
  if (!publicContentApiEnabled()) {
    return errorResponse(404, "NOT_FOUND", "接口不存在");
  }
  // 限流先于 token 校验扣减，避免 Bearer 爆破不受 429 约束
  if (!consumeRateLimit("public-api", 600)) {
    return errorResponse(429, "RATE_LIMITED", "请求过于频繁");
  }
  const token = contentApiReadToken();
  if (token) {
    const header = request.headers.get("authorization") ?? "";
    const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!provided || !constantTimeEquals(provided, token)) {
      return errorResponse(401, "UNAUTHENTICATED", "缺少或无效的读取凭证");
    }
  }
  return null;
}

export function publicJson(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data as object, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

/** 公开 API 的统一 404：draft/archived/不存在不可区分（API-002） */
export function publicNotFound(code: string): NextResponse {
  return errorResponse(404, code, "内容不存在");
}
