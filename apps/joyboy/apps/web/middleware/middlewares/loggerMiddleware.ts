import { NextResponse } from 'next/server';
import { CustomMiddleware, MiddlewareFactory } from '../lib/chain';
import { getOptionalParams, getRequiredParams } from '../lib/utils';
import { logger } from '@castlery/observability/server';

/**
 * 📝 Logger 中间件工厂
 *
 * 简单的请求日志记录，记录请求信息和处理结果
 *
 * 🎯 设计优势：
 * - 📊 记录请求基本信息
 * - 🔄 透明传递，不中断链路
 * - 📋 可以读取 headers 中的解析参数
 */
export function loggerMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const startTime = Date.now();
    const { pathname } = request.nextUrl;
    const method = request.method;

    try {
      // Execute the middleware chain
      const result = await middleware(request, event, response);

      // Only log significant events or slow requests
      const duration = Date.now() - startTime;

      if (result instanceof NextResponse) {
        if (result.headers.has('x-middleware-rewrite')) {
          const rewriteUrl = result.headers.get('x-middleware-rewrite');
          logger.info('Request rewritten', {
            middleware: 'Logger',
            method,
            from: pathname,
            to: rewriteUrl,
            duration,
          });
        } else if (result.headers.has('x-middleware-redirect')) {
          const redirectUrl = result.headers.get('location');
          logger.info('Request redirected', {
            middleware: 'Logger',
            method,
            from: pathname,
            to: redirectUrl,
            duration,
          });
        } else if (duration > 500) {
          // Only log slow requests
          logger.warn('Slow middleware execution', {
            middleware: 'Logger',
            method,
            pathname,
            duration,
          });
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Middleware chain failed', {
        middleware: 'Logger',
        method,
        pathname,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}
