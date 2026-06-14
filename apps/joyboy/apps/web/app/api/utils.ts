import { NextResponse } from 'next/server';
import type { ApiError, ApiErrorResponse, ApiListResponse } from '@castlery/types';
import { logger } from '@castlery/observability/server';

// =============================================================================
// Microsoft API Guidelines 标准响应函数
// =============================================================================

/**
 * 创建符合 Microsoft API Guidelines 的成功响应（集合类型）
 * @param data 响应数据
 * @param options 可选配置项
 * @returns NextResponse 对象
 */
export function createApiListResponse<T>(
  data: T,
  options?: {
    nextLink?: string;
    count?: number;
    status?: number;
  }
): NextResponse {
  const response: ApiListResponse<T> = {
    value: data,
  };

  if (options?.nextLink) {
    response['@nextLink'] = options.nextLink;
  }

  if (options?.count !== undefined) {
    response['@count'] = options.count;
  }

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * 创建单个资源的成功响应（不使用 value 包装）
 * 符合 Microsoft API Guidelines 对单个资源的要求
 * @param data 单个资源数据
 * @param options 可选配置项
 * @returns NextResponse 对象
 */
export function createApiItemResponse<T>(data: T, options?: ResponseInit): NextResponse {
  return NextResponse.json(data, { status: options?.status || 200, ...options });
}

/**
 * 创建符合 Microsoft API Guidelines 的错误响应
 * @param code 错误代码
 * @param message 错误消息
 * @param options 可选配置项
 * @returns NextResponse 对象
 */
export function createApiErrorResponse(
  code: string,
  message: string,
  options?: {
    target?: string;
    details?: ApiError[];
    innerError?: any;
    status?: number;
  }
): NextResponse {
  const error: ApiError = {
    code,
    message,
  };

  if (options?.target) {
    error.target = options.target;
  }

  if (options?.details) {
    error.details = options.details;
  }

  if (options?.innerError) {
    error.innerError = options.innerError;
  }

  const response: ApiErrorResponse = { error };

  return NextResponse.json(response, { status: options?.status || 500 });
}

// =============================================================================
// 常用错误响应便捷函数
// =============================================================================

export const ApiErrors = {
  /**
   * 404 Not Found
   */
  notFound: (message: string, target?: string) => createApiErrorResponse('NotFound', message, { target, status: 404 }),

  /**
   * 400 Bad Request - 缺少必需参数
   */
  missingParameter: (parameterName: string) =>
    createApiErrorResponse('MissingParameter', `Required parameter '${parameterName}' is missing`, {
      target: parameterName,
      status: 400,
    }),

  /**
   * 数据获取错误
   */
  fetchError: (resource: string, innerError?: any) =>
    createApiErrorResponse('FetchError', `Failed to fetch ${resource}`, { target: resource, innerError, status: 500 }),
};

// =============================================================================
// Retry 工具函数
// =============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
}

/**
 * 通用的重试函数
 * @param fn 要重试的异步函数
 * @param options 重试配置选项
 * @returns Promise<T> 重试成功后的结果
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2, maxDelayMs = 10000 } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();

      // 如果结果为空或null，也视为失败需要重试
      if (result === null || result === undefined) {
        throw new Error('Data is null or undefined');
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // 计算延迟时间（指数退避）
      const delay = Math.min(delayMs * Math.pow(backoffMultiplier, attempt - 1), maxDelayMs);

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { error });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
