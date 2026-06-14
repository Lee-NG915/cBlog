import { NextResponse } from 'next/server';
import { SUPPORTED_REGIONS } from '../constants';
import { MiddlewareFactory } from '../lib/chain';
import { logger } from '@castlery/observability/server';

/**
 * 🔄 API 重写中间件
 *
 * 处理国家前缀的API路径重写：
 * /国家/api/* -> /api/*
 *
 * 这个中间件需要在链的开头，并且当检测到API路径时直接返回，
 * 不让后续中间件处理
 */
export const apiRewriteMiddleware: MiddlewareFactory = (middleware) => {
  return async (request, event, response) => {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // 检测国家前缀的API路径模式：/xx/api/*
    const apiMatch = pathname.match(/^\/([a-z]{2})\/api\/(.*)/);

    if (apiMatch) {
      const [, countryCode, apiPath] = apiMatch;

      // 验证是否为支持的国家代码（SUPPORTED_REGIONS是小写的）
      const isValidCountry = SUPPORTED_REGIONS.includes(countryCode);

      if (isValidCountry) {
        // 重写URL到 /api/*
        const newUrl = url.clone();
        newUrl.pathname = `/api/${apiPath}`;

        // Debug log removed - too verbose for production

        // 直接重写到API路径，不经过后续中间件
        return NextResponse.rewrite(newUrl);
      }
    }

    // 直接的API路径，跳过所有中间件处理
    if (pathname.startsWith('/api/')) {
      // Debug log removed - too verbose for production
      return NextResponse.next();
    }

    // 非API路由，继续中间件链处理
    return middleware(request, event, response);
  };
};
