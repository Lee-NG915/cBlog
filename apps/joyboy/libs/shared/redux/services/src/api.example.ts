/**
 * api.example.ts — 客户端 API 最佳实践示例
 *
 * 分层结构：
 *   rawBaseQuery
 *     └─ clientBaseQueryWithReAuth   (伪200拦截 / 401 token刷新 / 5xx上报 / 429 Retry-After)
 *         └─ smartBaseQueryFn        (retry.fail 阻止 4xx 重试)
 *             └─ baseQueryWithRetry  (RTK retry: 指数退避 + Jitter)
 *                 └─ apiExample      (createApi)
 *
 * 对比现有 shared-base-query-with-re-auth.ts 的改进点：
 *   1. retry 改为"智能重试"——只重试 5xx/网络错误，4xx 立即 fail
 *   2. 指数退避 + Jitter，替代 RTK 默认的固定间隔
 *   3. 支持 Retry-After header（429 / 503）
 *   4. 拦截伪 200 业务错误码，统一转为 rejected
 *   5. 5xx 自动上报错误监控，不依赖业务层
 *   6. 403 语义更精确：只在账号级封禁时清除凭证，不一律 reload
 */

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  createApi,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { sharedPrepareHeaders } from './shared-prepare-headers';
import { tagTypes } from './tag-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** 伪 200 业务错误（BFF 以 HTTP 200 返回，body 中 code !== 0） */
export interface BizError {
  bizCode: number;
  message: string;
  data?: unknown;
}

type ClientBaseQueryError = FetchBaseQueryError | BizError;

/** 用于区分 BizError 和 FetchBaseQueryError */
export function isBizError(error: unknown): error is BizError {
  return typeof error === 'object' && error !== null && 'bizCode' in error;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** 这些状态码允许重试；429 单独处理（Retry-After） */
const RETRYABLE_STATUS = new Set([408, 500, 502, 503, 504]);

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 10_000;

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function calcBackoff(attempt: number): number {
  const jitter = Math.random() * 200;
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt) + jitter, MAX_DELAY_MS);
}

/**
 * 提取伪 200 业务错误。
 * 约定：响应体中存在 `code` 字段且 code !== 0 时视为业务错误。
 */
function extractBizError(data: unknown): BizError | null {
  if (data == null || typeof data !== 'object') return null;
  const { code, message } = data as Record<string, unknown>;
  if (typeof code === 'number' && code !== 0) {
    return { bizCode: code, message: String(message ?? ''), data };
  }
  return null;
}

function reportApiError(context: string, extra: Record<string, unknown>) {
  // 替换为 Sentry.captureException 或其他监控工具
  logger.error(context, extra);
}

// ─────────────────────────────────────────────────────────────────────────────
// 并发 401 去重：Mutex
// ─────────────────────────────────────────────────────────────────────────────

const mutex = new Mutex();

// ─────────────────────────────────────────────────────────────────────────────
// Layer 1: rawBaseQuery — 纯 fetchBaseQuery，不含任何拦截
// ─────────────────────────────────────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: EcEnv.NEXT_PUBLIC_API_HOST,
  // @ts-ignore — sharedPrepareHeaders 签名与 RTK 类型略有偏差
  prepareHeaders: sharedPrepareHeaders,
});

// ─────────────────────────────────────────────────────────────────────────────
// Layer 2: clientBaseQueryWithReAuth
//   - 伪 200 → BizError
//   - 401   → Token 刷新（Mutex 保证只发一次 refresh，其余请求排队等待）
//   - 403   → 仅账号封禁类错误清除凭证；权限不足类直接透传给业务层处理
//   - 429   → 读取 Retry-After header，存入模块变量供 backoff 使用
//   - 5xx   → 上报错误监控
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 模块级变量：存储服务端返回的 Retry-After 等待时间（ms）。
 * 在 backoff 回调中消费后清空。
 */
let pendingRetryAfterMs: number | null = null;

export const clientBaseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, ClientBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof args !== 'string' && !args?.url) {
    return { error: { status: 404, data: 'url not found' } as FetchBaseQueryError };
  }

  // 等待 mutex 释放（避免在 token 刷新期间发出无效请求）
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  // ── 伪 200 拦截 ────────────────────────────────────────────────────────────
  if (!result.error && result.data) {
    const bizError = extractBizError(result.data);
    if (bizError) {
      // 转为 rejected，业务层在 catch 里按 bizCode 分组处理
      return { error: bizError as unknown as FetchBaseQueryError, meta: result.meta };
    }
  }

  // ── 401: Token 刷新 ────────────────────────────────────────────────────────
  if (result.error?.status === 401) {
    const handles = makePersistenceHandles();
    const refreshToken =
      EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' ? handles.webRefreshToken?.getItem() : handles.refreshToken?.getItem();

    if (!refreshToken) {
      // 无 refresh token，清除 access token 后透传 401（业务层 / 路由层决定跳转）
      clearAccessToken(handles);
      return result;
    }

    if (!mutex.isLocked()) {
      // 拿锁，只发一次 refresh
      const release = await mutex.acquire();
      try {
        const refreshResult = await rawBaseQuery(
          {
            url: '/oauth/token',
            method: 'POST',
            body: { grant_type: 'refresh_token', refresh_token: refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { access_token, refresh_token: newRefresh } = refreshResult.data as {
            access_token: string;
            refresh_token: string;
          };
          saveTokens(handles, access_token, newRefresh);
          // 用新 token 重放原请求
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // refresh 失败：清除所有凭证，透传 401
          clearAllTokens(handles);
          reportApiError('Token refresh failed', {
            endpoint: api.endpoint,
            refreshError: refreshResult.error,
          });
        }
      } catch (err) {
        clearAllTokens(handles);
        reportApiError('Token refresh threw exception', { endpoint: api.endpoint, err });
      } finally {
        release();
      }
    } else {
      // 有其他请求正在 refresh，等待完成后用新 token 重试
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  // ── 403: 区分账号封禁 vs 普通权限不足 ────────────────────────────────────
  // 账号封禁：服务端在 errors 数组中携带封禁原因 → 清除凭证
  // 普通权限不足（功能级 403）→ 直接透传给业务层，业务层决定如何提示
  if (result.error?.status === 403) {
    const errorData = result.error.data as { errors?: unknown[] } | undefined;
    const isAccountBanned = Array.isArray(errorData?.errors) && errorData.errors.length > 0;

    if (isAccountBanned) {
      const handles = makePersistenceHandles();
      clearAllTokens(handles);
      reportApiError('Account banned (403 with errors)', {
        endpoint: api.endpoint,
        errors: errorData?.errors,
      });
    }
    // 无 errors 的 403 = 功能级权限不足，直接透传，不清凭证、不 reload
  }

  // ── 429: 提取 Retry-After，存储给 backoff 使用 ──────────────────────────
  if (result.error?.status === 429) {
    const retryAfterHeader = (result.meta as FetchBaseQueryMeta | undefined)?.response?.headers.get('retry-after');
    if (retryAfterHeader) {
      pendingRetryAfterMs = Number(retryAfterHeader) * 1000;
    }
    reportApiError('Rate limited (429)', {
      endpoint: api.endpoint,
      retryAfter: retryAfterHeader,
    });
  }

  // ── 5xx: 上报错误监控 ──────────────────────────────────────────────────────
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    reportApiError(`Server error ${result.error.status}`, {
      url: typeof args === 'string' ? args : args.url,
      endpoint: api.endpoint,
      status: result.error.status,
      traceId: (result.meta as FetchBaseQueryMeta | undefined)?.response?.headers.get('x-trace-id'),
    });
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3: smartBaseQueryFn
//   - 对不可重试的错误调用 retry.fail()，阻止 RTK retry 继续重试
//   - 4xx（除 408、429）→ 立即 fail，无需等待重试
// ─────────────────────────────────────────────────────────────────────────────

const smartBaseQueryFn: BaseQueryFn<string | FetchArgs, unknown, ClientBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await clientBaseQueryWithReAuth(args, api, extraOptions);

  if (result.error) {
    const status = (result.error as FetchBaseQueryError).status;

    // 4xx（非 408/429）：重试无意义（参数/权限问题），立即终止
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      retry.fail(result.error);
    }
    // 'PARSING_ERROR' / 'CUSTOM_ERROR'：不重试
    if (typeof status === 'string') {
      retry.fail(result.error);
    }
    // BizError：业务码错误不重试
    if (isBizError(result.error)) {
      retry.fail(result.error);
    }
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Layer 4: baseQueryWithRetry
//   - 指数退避 + Jitter（默认）
//   - 若服务端返回了 Retry-After，优先遵守
// ─────────────────────────────────────────────────────────────────────────────

const baseQueryWithRetry = retry(smartBaseQueryFn, {
  maxRetries: MAX_RETRIES,
  backoff: async (attempt) => {
    if (pendingRetryAfterMs !== null) {
      // 服务端指定了等待时间（429 / 503），优先遵守
      await sleep(pendingRetryAfterMs);
      pendingRetryAfterMs = null;
    } else {
      await sleep(calcBackoff(attempt));
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// createApi
// ─────────────────────────────────────────────────────────────────────────────

export const apiExample = createApi({
  reducerPath: 'castlery_example',
  baseQuery: baseQueryWithRetry,
  tagTypes: Object.values(tagTypes),
  endpoints: () => ({}),
});

// ─────────────────────────────────────────────────────────────────────────────
// Token Helpers
// ─────────────────────────────────────────────────────────────────────────────

type PersistenceHandles = ReturnType<typeof makePersistenceHandles>;

function clearAccessToken(handles: PersistenceHandles) {
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    handles.webAccessToken?.removeItem();
  } else {
    handles.accessToken?.removeItem();
  }
}

function clearAllTokens(handles: PersistenceHandles) {
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    handles.webAccessToken?.removeItem();
    handles.webRefreshToken?.removeItem();
  } else {
    handles.accessToken?.removeItem();
    handles.refreshToken?.removeItem();
    handles.isLoggedIn?.removeItem();
  }
}

function saveTokens(handles: PersistenceHandles, accessToken: string, refreshToken: string) {
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    handles.webAccessToken?.setItem(accessToken);
    handles.webRefreshToken?.setItem(refreshToken);
  } else {
    handles.accessToken?.setItem(accessToken);
    handles.refreshToken?.setItem(refreshToken);
    handles.isLoggedIn?.setItem('1');
  }
}
