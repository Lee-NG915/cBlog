/**
 * api.example.server.ts — SSR 端 API 最佳实践示例
 *
 * SSR 与客户端的核心差异：
 *   ┌─────────────────────────┬──────────────────┬──────────────────────┐
 *   │ 能力                     │ Client           │ SSR                  │
 *   ├─────────────────────────┼──────────────────┼──────────────────────┤
 *   │ Token 来源               │ localStorage     │ req.cookies（只读）  │
 *   │ Token 刷新               │ ✅ 可刷新并持久化 │ ❌ 不刷新（无法回写） │
 *   │ 401 处理                 │ silent refresh   │ 直接透传，交页面处理  │
 *   │ 跳转登录页               │ window.location  │ 由 getServerSideProps │
 *   │                         │                  │ 返回 redirect 处理   │
 *   │ 重试 5xx                 │ ✅               │ ✅（server-to-server）│
 *   │ 重试 4xx                 │ ❌               │ ❌                   │
 *   │ 伪 200 拦截              │ ✅               │ ✅（如有需要）        │
 *   │ 错误上报                 │ Sentry browser   │ Sentry server / log  │
 *   └─────────────────────────┴──────────────────┴──────────────────────┘
 *
 * 使用方式（Next.js getServerSideProps）：
 *   export const getServerSideProps = wrapper.getServerSideProps(
 *     (store) => async (context) => {
 *       const result = await store.dispatch(
 *         serverApiExample.endpoints.someEndpoint.initiate(params)
 *       );
 *       if ('error' in result && result.error?.status === 401) {
 *         return { redirect: { destination: `/login?redirect=${context.resolvedUrl}`, permanent: false } };
 *       }
 *       return { props: {} };
 *     }
 *   );
 */

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  createApi,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query';
import { EcEnv, X_ACCESS_TOKEN, X_CHANNEL, accessInServer } from '@castlery/config';
import { logger } from '@castlery/observability';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { tagTypes } from './tag-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BizError {
  bizCode: number;
  message: string;
  data?: unknown;
}

type ServerBaseQueryError = FetchBaseQueryError | BizError;

function isBizError(error: unknown): error is BizError {
  return typeof error === 'object' && error !== null && 'bizCode' in error;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RETRYABLE_STATUS = new Set([408, 500, 502, 503, 504]);
const MAX_RETRIES = 2; // SSR server-to-server，重试次数相对保守
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 5_000;

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function calcBackoff(attempt: number): number {
  const jitter = Math.random() * 100;
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt) + jitter, MAX_DELAY_MS);
}

function extractBizError(data: unknown): BizError | null {
  if (data == null || typeof data !== 'object') return null;
  const { code, message } = data as Record<string, unknown>;
  if (typeof code === 'number' && code !== 0) {
    return { bizCode: code, message: String(message ?? ''), data };
  }
  return null;
}

function reportServerError(context: string, extra: Record<string, unknown>) {
  logger.error(context, extra);
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 1: rawServerBaseQuery
//
// 与客户端不同：prepareHeaders 从 req.cookies 读取 token（只读，不写入）
// ─────────────────────────────────────────────────────────────────────────────

const rawServerBaseQuery = fetchBaseQuery({
  baseUrl: EcEnv.NEXT_PUBLIC_API_HOST,
  prepareHeaders: (headers, { extra }) => {
    const { context } = extra as ExtraArgument;

    // X_CHANNEL
    if (!headers.has(X_CHANNEL)) {
      headers.set(X_CHANNEL, EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase());
    }

    // Access Token：只从 req.cookies 读取，不做刷新
    if (!headers.has(X_ACCESS_TOKEN) && accessInServer) {
      // @ts-ignore — context.req 由 next-redux-wrapper 注入
      const cookies: Record<string, string> = context?.req?.cookies ?? {};
      const tokenKey = EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' ? 'web_access_token' : 'access_token';
      const token = cookies[tokenKey];
      if (token) {
        headers.set(X_ACCESS_TOKEN, token);
      }
    }

    return headers;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Layer 2: serverBaseQueryFn
//
//   - 伪 200 → BizError（同客户端）
//   - 401   → 直接透传；SSR 不刷新 token，由 getServerSideProps 负责重定向
//   - 403   → 直接透传；SSR 不清除 cookie（只读），由页面层决定展示
//   - 429   → 提取 Retry-After
//   - 5xx   → 结构化日志上报（附带请求上下文）
// ─────────────────────────────────────────────────────────────────────────────

let pendingRetryAfterMs: number | null = null;

export const serverBaseQueryFn: BaseQueryFn<string | FetchArgs, unknown, ServerBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof args !== 'string' && !args?.url) {
    return { error: { status: 404, data: 'url not found' } as FetchBaseQueryError };
  }

  const result = await rawServerBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args.url;

  // ── 伪 200 拦截 ────────────────────────────────────────────────────────────
  if (!result.error && result.data) {
    const bizError = extractBizError(result.data);
    if (bizError) {
      return { error: bizError as unknown as FetchBaseQueryError, meta: result.meta };
    }
  }

  // ── 401: 直接透传（SSR 不刷新 token）─────────────────────────────────────
  // 说明：
  // - 在传统 pages router + getServerSideProps 场景：由页面层检测到 401 后返回 redirect 到登录页；
  // - 在 Next App Router + Middleware 场景：推荐在中间件里基于 cookie 统一做 refresh，
  //   成功后再进入页面逻辑；此时 serverBaseQueryFn 只负责读取 cookie，不再发 refresh 请求。
  //   若中间件仍返回 401，通常表示 refresh 也失败了，应透传给页面跳登录。
  // getServerSideProps 检测到 401 后应返回:
  //   { redirect: { destination: `/login?redirect=${ctx.resolvedUrl}` } }
  if (result.error?.status === 401) {
    reportServerError('SSR 401 Unauthorized', {
      url: requestUrl,
      endpoint: api.endpoint,
    });
    // 直接 return，不做任何 token 操作（SSR 无法写回 cookie）
    return result;
  }

  // ── 403: 直接透传（SSR 不修改任何状态）──────────────────────────────────
  if (result.error?.status === 403) {
    reportServerError('SSR 403 Forbidden', {
      url: requestUrl,
      endpoint: api.endpoint,
    });
    return result;
  }

  // ── 429: 提取 Retry-After ─────────────────────────────────────────────────
  if (result.error?.status === 429) {
    const retryAfterHeader = (result.meta as FetchBaseQueryMeta | undefined)?.response?.headers.get('retry-after');
    if (retryAfterHeader) {
      pendingRetryAfterMs = Number(retryAfterHeader) * 1000;
    }
    reportServerError('SSR Rate limited (429)', {
      url: requestUrl,
      endpoint: api.endpoint,
      retryAfter: retryAfterHeader,
    });
  }

  // ── 5xx: 结构化日志上报 ───────────────────────────────────────────────────
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    reportServerError(`SSR Server error ${result.error.status}`, {
      url: requestUrl,
      endpoint: api.endpoint,
      status: result.error.status,
      traceId: (result.meta as FetchBaseQueryMeta | undefined)?.response?.headers.get('x-trace-id'),
    });
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3: smartServerBaseQueryFn
//   - 4xx（非 408/429）→ retry.fail，不重试
//   - BizError         → retry.fail
//   - 401 / 403        → retry.fail（SSR 无法靠重试解决认证/权限问题）
// ─────────────────────────────────────────────────────────────────────────────

const smartServerBaseQueryFn: BaseQueryFn<string | FetchArgs, unknown, ServerBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await serverBaseQueryFn(args, api, extraOptions);

  if (result.error) {
    const status = (result.error as FetchBaseQueryError).status;

    // 所有 4xx（含 401/403）— 服务端返回明确的客户端错误，重试无意义
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      retry.fail(result.error);
    }
    if (typeof status === 'string') {
      retry.fail(result.error);
    }
    if (isBizError(result.error)) {
      retry.fail(result.error);
    }
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Layer 4: serverBaseQueryWithRetry
//   - 只有 5xx / 网络错误 / 429 会走到这里（其他已被 retry.fail 阻止）
// ─────────────────────────────────────────────────────────────────────────────

const serverBaseQueryWithRetry = retry(smartServerBaseQueryFn, {
  maxRetries: MAX_RETRIES,
  backoff: async (attempt) => {
    if (pendingRetryAfterMs !== null) {
      await sleep(pendingRetryAfterMs);
      pendingRetryAfterMs = null;
    } else {
      await sleep(calcBackoff(attempt));
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// createApi — 使用 '@reduxjs/toolkit/query'（无 /react），SSR 不需要 hooks
// ─────────────────────────────────────────────────────────────────────────────

export const serverApiExample = createApi({
  reducerPath: 'castlery_server_example',
  baseQuery: serverBaseQueryWithRetry,
  tagTypes: Object.values(tagTypes),
  endpoints: () => ({}),
});
