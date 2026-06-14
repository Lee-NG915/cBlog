import { NextResponse } from 'next/server';
import { MiddlewareFactory } from '../lib/chain';
import { logger } from '@castlery/observability/server';
import { EcEnv } from '@castlery/config';

/**
 * 🌐 CORS 中间件
 *
 * 处理跨域资源共享，支持预检请求和简单请求
 * 只对 API 路径生效，不影响页面路由
 */
export const corsMiddleware: MiddlewareFactory = (middleware) => {
  return async (request, event, response) => {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // 只对 API 路径应用 CORS
    if (!pathname.startsWith('/api/')) {
      return middleware(request, event, response);
    }

    // CORS 配置
    const allowedOrigins = EcEnv.ALLOWED_ORIGINS?.split(',') || [];

    const corsOptions = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, sentry-trace, baggage',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    // 检查请求来源
    const origin = request.headers.get('origin') ?? '';
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // 处理预检请求 (OPTIONS)
    const isPreflight = request.method === 'OPTIONS';

    if (isPreflight) {
      logger.debug(`🔄 CORS Preflight: ${pathname} from ${origin}`);

      const preflightHeaders = {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      };

      return NextResponse.json({}, { headers: preflightHeaders });
    }

    // 处理简单请求
    logger.debug(`✅ CORS Simple Request: ${pathname} from ${origin}`);

    // 继续中间件链处理
    const nextResponse = await middleware(request, event, response);

    // 确保响应对象存在
    if (!nextResponse) {
      return response;
    }

    // 如果是允许的来源，添加 CORS 头
    if (isAllowedOrigin) {
      nextResponse.headers.set('Access-Control-Allow-Origin', origin);
    }

    // 添加其他 CORS 头
    Object.entries(corsOptions).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  };
};
