import { startSpan } from '@sentry/nextjs';
import type { MonitoringContext } from '../../monitoring/types';
import { captureStructuredError } from '../capture/capture-error';
import { isExpectedBusinessError } from '../errors/error-utils';
import { BusinessSeverity } from '../../monitoring/priorities';

/**
 * 简单的 fetch 包装函数：在现有 fetch 调用基础上添加 span 追踪和错误捕获
 *
 * **⚠️ 仅用于服务端（Server Components、API Routes、Middleware 等）**
 *
 * **使用场景**：
 * - ✅ Server Components 中的 API 调用
 * - ✅ API Routes / Route Handlers
 * - ✅ Middleware
 * - ✅ 后台任务、定时任务
 * - ❌ Server Actions（请使用 `withServerActionInstrumentation`）
 * - ❌ 客户端组件（Sentry 会自动追踪）
 *
 * **为什么要用？**
 * - 服务端需要手动创建 span 来追踪 API 调用性能
 * - 客户端 Sentry 会自动追踪所有 fetch，无需手动封装
 *
 * @param fetchCall - 返回 Promise<Response> 的 fetch 调用函数
 * @param options - 追踪配置选项
 * @returns Fetch Response
 *
 * @example
 * ```typescript
 * // ✅ Server Component
 * async function ProductList() {
 *   const response = await withFetchSpan(
 *     () => fetch('https://api.example.com/products'),
 *     { context: { domain: 'fetch_list' } }
 *   );
 *   const data = await response.json();
 *   return <div>{data.map(...)}</div>;
 * }
 *
 * // ✅ API Route
 * export async function GET() {
 *   const data = await withFetchSpan(
 *     () => fetchData(url, options),
 *     { context: { domain: 'proxy_request' } }
 *   );
 *   return Response.json(data);
 * }
 *
 * // ❌ Server Action（用 withServerActionInstrumentation）
 * export const submitForm = withServerActionInstrumentation(
 *   async (formData: FormData) => { ... },
 *   { actionName: 'submitForm' }
 * );
 *
 * // ❌ 客户端（让 Sentry 自动追踪）
 * 'use client';
 * try {
 *   const response = await fetch('https://api.example.com/products');
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 * } catch (error) {
 *   captureStructuredError(error as Error, {
 *     domain: 'fetch_list',
 *   });
 * }
 * ```
 */
export async function withFetchSpan<T = Response>(
  fetchCall: () => Promise<T>,
  options: {
    /** 上下文信息（用于 Issue 路由和优先级区分） */
    context?: MonitoringContext;
    /** Span 名称（可选，默认从 URL 推断） */
    spanName?: string;
  } = {}
): Promise<T> {
  const { context = {}, spanName } = options;
  const endpoint = spanName || 'fetch';

  // 创建 Sentry span 追踪 API 调用（服务端专用）
  return await startSpan(
    {
      name: spanName || `fetch ${endpoint}`,
      op: 'http.client',
      attributes: {
        'http.endpoint': endpoint,
      },
    },
    async (span) => {
      try {
        const result = await fetchCall();

        // 如果是 Response 对象，设置 span 属性
        if (result instanceof Response) {
          span?.setAttribute('http.status_code', result.status);
          span?.setStatus({ code: result.ok ? 1 : 2, message: result.ok ? 'ok' : 'http_error' });

          // 如果响应失败，捕获错误
          if (!result.ok) {
            const error = new Error(`HTTP ${result.status}: ${result.statusText}`);
            (error as any).status = result.status;
            (error as any).response = result;

            captureStructuredError(error, {
              ...context,
              severity: result.status >= 500 ? BusinessSeverity.HIGH : BusinessSeverity.MEDIUM,
              tags: {
                ...context.tags,
                http_status: result.status.toString(),
              },
              extra: {
                ...context.extra,
                status: result.status,
                statusText: result.statusText,
              },
            });
          }
        } else {
          // 非 Response 对象，设置成功状态
          span?.setStatus({ code: 1, message: 'ok' });
        }

        return result;
      } catch (error) {
        // 设置 span 状态为错误
        span?.setStatus({ code: 2, message: 'internal_error' });

        // Skip Sentry for expected business errors (404 not found, 409 conflict, etc.)
        // These are normal application flows, not incidents — reporting them pollutes alert rules.
        if (!isExpectedBusinessError(error)) {
          captureStructuredError(error as Error, {
            ...context,
            severity: BusinessSeverity.HIGH,
          });
        }

        throw error;
      }
    }
  );
}

// ============================================================================
// 🔌 插件式工具：包装现有的请求方法
// ============================================================================

/**
 * 包装单个方法，添加 Sentry 追踪（插件式）
 *
 * **使用场景**：对现有的请求方法添加 Sentry 追踪，无需重构代码
 *
 * @param method - 要包装的方法
 * @param options - 追踪配置选项
 * @returns 包装后的方法
 *
 * @example
 * ```typescript
 * // ✅ 包装现有的 fetchData 函数
 * import { fetchData as originalFetchData } from './utils';
 *
 * const fetchData = wrapMethod(originalFetchData, {
 *   context: { domain: 'fetch_data' },
 *   spanName: 'fetchData',
 * });
 *
 * // 使用时和原来一样，但自动添加了 Sentry 追踪
 * const data = await fetchData(url, options);
 * ```
 */
export function wrapMethod<T extends (...args: any[]) => Promise<any>>(
  method: T,
  options: {
    /** 上下文信息（用于 Issue 路由和优先级区分） */
    context?: MonitoringContext;
    /** Span 名称 */
    spanName?: string;
  } = {}
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    return withFetchSpan(() => method(...args), options) as ReturnType<T>;
  }) as unknown as T;
}

/**
 * 包装 Client 对象的指定方法（插件式）
 *
 * **使用场景**：对现有的 Client 对象（如 Storyblok client）添加 Sentry 追踪
 *
 * @param client - 要包装的 client 对象
 * @param methodNames - 要包装的方法名称列表
 * @param options - 追踪配置选项
 * @returns 包装后的 client（Proxy）
 *
 * @example
 * ```typescript
 * // ✅ 包装 Storyblok client
 * import { storyblokInit } from '@storyblok/js';
 *
 * const originalClient = storyblokInit({ ... }).storyblokApi;
 *
 * const storyblokClient = wrapClient(originalClient, ['get', 'getAll'], {
 *   context: { domain: 'storyblok' },
 *   getSpanName: (methodName) => `storyblok.${methodName}`,
 * });
 *
 * // 使用时和原来一样，但自动添加了 Sentry 追踪
 * const story = await storyblokClient.get('cdn/stories/home');
 * const stories = await storyblokClient.getAll('cdn/stories');
 * ```
 */
export function wrapClient<T extends Record<string, any>>(
  client: T | null | undefined,
  methodNames: (keyof T)[],
  options: {
    /** 上下文信息 */
    context?: MonitoringContext;
    /** 动态生成 Span 名称的函数 */
    getSpanName?: (methodName: string, args: unknown[]) => string;
  } = {}
): T {
  if (!client) return client as unknown as T;

  const { context = {}, getSpanName } = options;
  // Set 查找 O(1)，避免每次属性访问都遍历数组
  const wrappedMethods = new Set(methodNames as PropertyKey[]);

  const proxy = new Proxy(client, {
    get(target, prop) {
      const originalValue = target[prop as keyof T];

      if (typeof prop === 'string' && wrappedMethods.has(prop) && typeof originalValue === 'function') {
        const originalFn = originalValue as (...args: unknown[]) => Promise<unknown>;
        return (...args: unknown[]) => {
          const spanName = getSpanName ? getSpanName(prop, args) : prop;
          return withFetchSpan(() => originalFn.apply(target, args), { context, spanName });
        };
      }

      // 非包装方法绑定到 target，避免 this 指向 proxy
      if (typeof originalValue === 'function') {
        return (originalValue as (...args: unknown[]) => unknown).bind(target);
      }

      return originalValue;
    },
  });

  return proxy as T;
}

// ============================================================================
// 🎯 工厂函数：创建带 Sentry 追踪的请求函数
// ============================================================================

/**
 * 创建带自定义 context 的 GET 请求函数（推荐）
 *
 * ⚠️ 需要传入原始的 get 函数，避免循环依赖
 *
 * @param originalGet - 原始的 GET 请求函数（从 @castlery/utils 导入）
 * @param context - Sentry 上下文信息（domain、priority 等）
 * @returns 包装后的 GET 请求函数
 *
 * @example
 * ```typescript
 * // 在你的模块中（如 libs/modules/product/domain/src/api/http.ts）
 * import { get as originalGet } from '@castlery/utils';
 * import { createTrackedGet } from '@castlery/observability';
 *
 * // 为 product 模块创建专用的 get 函数
 * export const pdpGet = createTrackedGet(originalGet, {
 *   domain: 'get_pdp_product',
 *   priority: BusinessPriority.HIGH,
 * });
 *
 * // 使用时和原版 get 完全一样
 * const data = await pdpGet(url, {
 *   headers: { ... },
 *   authOption: true,
 * });
 * ```
 */
export function createTrackedGet<T extends (...args: any[]) => Promise<any>>(
  originalGet: T,
  context: MonitoringContext
): T {
  return wrapMethod(originalGet, {
    context,
    spanName: `${context.domain || 'api'}.get`,
  });
}

/**
 * 创建带自定义 context 的 POST 请求函数（推荐）
 *
 * ⚠️ 需要传入原始的 post 函数，避免循环依赖
 *
 * @param originalPost - 原始的 POST 请求函数（从 @castlery/utils 导入）
 * @param context - Sentry 上下文信息（domain、priority 等）
 * @returns 包装后的 POST 请求函数
 *
 * @example
 * ```typescript
 * // 在你的模块中（如 libs/modules/product/domain/src/api/http.ts）
 * import { post as originalPost } from '@castlery/utils';
 * import { createTrackedPost } from '@castlery/observability';
 *
 * // 为 user 模块创建专用的 post 函数
 * export const userPost = createTrackedPost(originalPost, {
 *   domain: 'user_api',
 *   priority: BusinessPriority.HIGH,
 * });
 *
 * // 使用时和原版 post 完全一样
 * const data = await userPost(url, {
 *   body: { ... },
 *   authOption: true,
 * });
 * ```
 */
export function createTrackedPost<T extends (...args: any[]) => Promise<any>>(
  originalPost: T,
  context: MonitoringContext
): T {
  return wrapMethod(originalPost, {
    context,
    spanName: `${context.domain || 'api'}.post`,
  });
}
