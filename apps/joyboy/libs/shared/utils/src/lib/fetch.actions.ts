'use server';
import { EcEnv, X_ACCESS_TOKEN } from '@castlery/config';
import { logger } from '@castlery/observability';
import { Mutex } from 'async-mutex';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { cookies } from 'next/headers';
export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  nextOption?: Object;
  cacheOption?: RequestCache;
  body?: any;
  params?: Record<string, string>;
  authOption?: boolean; // 是否需要认证（会自动读取 token）
  isClientSide?: boolean; // 是否从客户端组件调用（影响 token 刷新、401 重试和 cookie 操作）
}

interface ErrorHandler {
  (responseData: any, response: Response, options: FetchOptions): Promise<any>;
}

const DEFAULT_TIMEOUT = 5000; // 默认超时时间（毫秒）
const MAX_RETRIES = 3; // 默认最大重试次数
const RETRY_DELAY = 200; // 默认重试延迟（毫秒）

const errorCodeMap: Record<number, ErrorHandler> = {
  401: async (responseData, response, options) => {
    if (options?.authOption) {
      logger.warn('401 Unauthorized - authentication required', {
        url: response.url,
        method: options?.method,
      });
    }
    return responseData;
  },
  403: async (responseData, response, options) => {
    if (options?.authOption) {
      logger.warn('403 Forbidden - access denied', {
        url: response.url,
        method: options?.method,
      });
    }
    return responseData;
  },
  // 添加更多的错误码处理逻辑
};

const requestInterceptor = (options: FetchOptions) => {
  // 添加全局 Token 或其他 headers
  const { authOption = false } = options; // 用来检测是不是不需要 auth 的请求，比如 refresh token 中调用 auth 会导致无限循环调用 auth，导致爆栈

  // 如果需要认证，从 cookie 读取最新的 token
  let accessToken = '';
  if (authOption) {
    const persistenceHandles = getPersistenceHandles();
    accessToken =
      (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB'
        ? persistenceHandles?.webAccessToken?.getItem()
        : persistenceHandles?.accessToken?.getItem()) || '';
  }

  const convertedOptions = {
    headers: {
      'X-Channel': EcEnv.NEXT_PUBLIC_CHANNEL.toLocaleLowerCase(),
      'Content-Type': 'application/json',
      ...(accessToken && {
        [`${X_ACCESS_TOKEN}`]: accessToken,
      }),
      ...options?.headers,
    },
    method: options?.method,
    body: options?.body,
    next: options?.nextOption,
    cache: options?.cacheOption, // Specify cache option as RequestCache value
  };
  return convertedOptions;
};

const handleResponseError = async (response: Response, responseData: any, options: FetchOptions) => {
  const errorHandler = errorCodeMap[response.status];

  if (errorHandler) {
    return await errorHandler(responseData, response, options);
  }

  return responseData;
};

// 请求重试锁
const retryLocks = new Map();

// Token 刷新锁，防止并发刷新
const refreshMutex = new Mutex();

/**
 * 获取 persistence handles（统一管理，避免重复创建）
 */
function getPersistenceHandles() {
  return makePersistenceHandles({
    cookies,
  });
}

/**
 * 刷新 token
 */
async function refreshAccessToken() {
  const persistenceHandles = getPersistenceHandles();

  // 获取 refresh_token
  const refresh_token =
    EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB'
      ? persistenceHandles?.webRefreshToken?.getItem()
      : persistenceHandles?.refreshToken?.getItem();

  if (!refresh_token) {
    throw new Error('No refresh token available');
  }

  // 调用刷新接口
  const response = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Channel': EcEnv.NEXT_PUBLIC_CHANNEL.toLocaleLowerCase(),
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const tokenData = await response.json();
  const { access_token, refresh_token: new_refresh_token } = tokenData;

  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    persistenceHandles.webAccessToken.setItem(access_token);
    persistenceHandles.webRefreshToken.setItem(new_refresh_token);
  } else {
    persistenceHandles.accessToken.setItem(access_token);
    persistenceHandles.refreshToken.setItem(new_refresh_token);
    persistenceHandles.isLoggedIn.setItem('1');
  }

  return access_token;
}

// 安全的 JSON.stringify，防止循环引用
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};

// 带重试和超时的 fetch 请求
export const fetchData = async (
  url: string,
  options: FetchOptions,
  timeout = DEFAULT_TIMEOUT,
  retries = MAX_RETRIES
) => {
  // 保存原始 options 用于缓存键
  const originalOptions = { ...options };

  // 创建一个唯一的锁键（仅用于内部重试，不影响 Next.js 的去重）
  const lockKey = `${url}-${safeStringify(originalOptions)}`;

  // 检查是否有现有的重试锁
  if (retryLocks.has(lockKey)) {
    return retryLocks.get(lockKey); // 返回现有的重试锁
  }

  // 创建新的重试锁
  const retryPromise = (async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    // 设置超时处理
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let authRetryAttempted = false; // 标记是否已经尝试过刷新 token
    const currentOptions = { ...options }; // 保存当前选项的副本

    const fetchAttempt = async (attempt: number, isAuthRetry = false) => {
      try {
        // 请求前拦截器（创建新的选项对象，不修改原始）
        const fetchOptions = requestInterceptor(currentOptions);
        // 发出请求
        // ⚠️ 注意：Next.js 会自动去重相同的请求
        // 如果相同 url + options 在同一个渲染周期内被调用，Next.js 会返回缓存的结果
        const response = await fetch(url, { ...fetchOptions, signal });
        // 先检查响应状态

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: Request failed`;
          let errorData: Record<string, unknown> | undefined;
          try {
            errorData = await response.json();
            errorMessage = (errorData?.['message'] as string) || (errorData?.['error'] as string) || errorMessage;
          } catch {
            // do nothing
          }
          const requestId =
            response.headers.get('X-Request-Id') ||
            response.headers.get('Request-Id') ||
            (errorData?.['requestId'] as string) ||
            (errorData?.['request_id'] as string) ||
            undefined;
          if (response.status === 401) {
            logger.error('401 Unauthorized - Request details', {
              url,
              method: currentOptions?.method || 'GET',
              headers: fetchOptions.headers,
              hasAuth: !!fetchOptions.headers['X-Access-Token'],
              authOption: currentOptions?.authOption,
            });
          }

          // 处理 401 错误，自动刷新 token 并重试（仅客户端调用时执行）
          if (response.status === 401 && currentOptions.isClientSide && !authRetryAttempted && !isAuthRetry) {
            authRetryAttempted = true;

            // 等待 mutex 释放（可能其他请求正在刷新 token）
            await refreshMutex.waitForUnlock();

            // 检查 mutex 是否已经锁定（另一个请求正在刷新）
            if (!refreshMutex.isLocked()) {
              const release = await refreshMutex.acquire();
              try {
                logger.info('Attempting to refresh access token', { url });
                await refreshAccessToken();

                // 更新认证选项（requestInterceptor 会自动从 cookie 读取最新的 token）
                currentOptions.authOption = true;
                release();

                // 重新发送请求（使用 isAuthRetry=true 标识这是认证重试）
                // requestInterceptor 会自动从 cookie 读取刷新后的新 token
                return fetchAttempt(attempt, true);
              } catch (refreshError) {
                release();
                logger.error('Failed to refresh access token', { error: refreshError });

                // 刷新失败，清理 tokens（仅客户端调用时）
                if (currentOptions.isClientSide) {
                  const persistenceHandles = getPersistenceHandles();
                  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
                    persistenceHandles.webAccessToken.removeItem();
                    persistenceHandles.webRefreshToken.removeItem();
                  } else {
                    persistenceHandles.accessToken.removeItem();
                    persistenceHandles.refreshToken.removeItem();
                    persistenceHandles.isLoggedIn.removeItem();
                  }
                }
              }
            } else {
              // 等待当前正在刷新 token 的请求完成
              await refreshMutex.waitForUnlock();

              // ⚠️ 关键：等待其他请求刷新完成后，requestInterceptor 会自动从 cookie 读取最新的 token
              logger.info('Other request refreshed token, will retry with latest token from cookie', { url });

              // 更新认证选项
              currentOptions.authOption = true;

              // 重新发送请求（不传 token，requestInterceptor 会自动从 cookie 读取最新值）
              return fetchAttempt(attempt, true);
            }
          }

          // 如果 401 重试后仍然是 401，或者已经刷新过但再次遇到 401，直接清理并抛出错误（仅客户端调用时）
          if (response.status === 401 && currentOptions.isClientSide && (isAuthRetry || authRetryAttempted)) {
            logger.error('401 after token refresh, token may be invalid', {
              url,
              isAuthRetry,
              authRetryAttempted,
            });
            // 清理 tokens（仅客户端调用时）
            const persistenceHandles = getPersistenceHandles();
            if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
              persistenceHandles.webAccessToken.removeItem();
              persistenceHandles.webRefreshToken.removeItem();
            } else {
              persistenceHandles.accessToken.removeItem();
              persistenceHandles.refreshToken.removeItem();
              persistenceHandles.isLoggedIn.removeItem();
            }
          }

          // Log at warn level — callers using captureStructuredError will log at error level
          // with full domain context. Using error here would cause double error breadcrumbs.
          if (attempt === retries) {
            logger.warn('Fetch request failed', {
              url,
              method: currentOptions?.method || 'GET',
              status: response.status,
              errorMessage,
              attempts: attempt + 1,
              ...(requestId && { requestId }),
            });
          }

          const error = new Error(errorMessage);
          Object.assign(error, {
            status: response.status,
            name: 'HttpError',
            ...(requestId && { requestId }),
          });
          throw error;
        }

        // 解析响应数据
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          logger.error('Failed to parse response as JSON', {
            url,
            method: currentOptions?.method || 'GET',
          });
          throw new Error('Failed to parse response as JSON');
        }

        // 处理响应错误（如果有特定的错误处理逻辑）
        const finalResponse = await handleResponseError(response, responseData, currentOptions);

        // 返回解析后的 JSON 数据
        return finalResponse;
      } catch (error: any) {
        // 处理超时错误
        if (error.name === 'AbortError') {
          logger.error('Request timed out', {
            url,
            method: currentOptions?.method || 'GET',
            timeout,
            attempts: attempt + 1,
          });
          throw new Error('Request timed out');
        }

        if (attempt < retries) {
          if (isAuthRetry && currentOptions.isClientSide) {
            logger.warn('Auth retry failed, will retry once more', {
              url,
              method: currentOptions?.method || 'GET',
              error: error?.message,
            });
            await new Promise((res) => setTimeout(res, RETRY_DELAY));
            // 重新开始（requestInterceptor 会自动从 cookie 读取最新 token）
            return fetchAttempt(attempt, false);
          }

          // 正常重试
          logger.warn('Retrying request', {
            url,
            method: currentOptions?.method || 'GET',
            attempt: attempt + 1,
            maxRetries: retries,
            error: error?.message,
          });
          await new Promise((res) => setTimeout(res, RETRY_DELAY)); // 延迟后重试
          return fetchAttempt(attempt + 1, false);
        }

        throw error;
      }
    };

    try {
      return await fetchAttempt(0, false);
    } finally {
      clearTimeout(timeoutId); // 清除超时
      retryLocks.delete(lockKey); // 删除重试锁
    }
  })();

  retryLocks.set(lockKey, retryPromise); // 设置重试锁
  return retryPromise;
};

// 封装 GET 请求
export const get = async (url: string, options: FetchOptions, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) => {
  return fetchData(url, { ...options, method: 'GET' }, timeout, retries);
};

// 封装 POST 请求
export const post = async (url: string, options: FetchOptions, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) => {
  return fetchData(
    url,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(options?.body),
    },
    timeout,
    retries
  );
};

// 封装 PUT 请求
export const put = async (url: string, options: FetchOptions, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) => {
  return fetchData(
    url,
    {
      ...options,
      method: 'PUT',
      body: JSON.stringify(options?.body),
    },
    timeout,
    retries
  );
};

// 封装 DELETE 请求
export const del = async (url: string, options: FetchOptions, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) => {
  return fetchData(url, { ...options, method: 'DELETE' }, timeout, retries);
};
