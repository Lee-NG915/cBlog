import { NextResponse } from 'next/server';
import { CustomMiddleware, MiddlewareFactory } from '../lib/chain';
import { buildInternalUrl, getRequiredParams, createRewriteWithState } from '../lib/utils';
import { logger } from '@castlery/observability/server';

/**
 * 🏠 首页中间件工厂
 *
 * 处理根路径 '/' 的重写到实际首页内容
 * 在 countrySelectMiddleware 之后运行，确保用户在国家特定路径上
 *
 * 🎯 设计优势：
 * - 📋 从 headers 读取参数
 * - 🛑 直接返回 NextResponse.rewrite() 中断链路
 * - 🏠 专注首页路径处理
 */
export function homeMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // === 第一步：获取类型安全的参数 ===
    const { originalPathname } = getRequiredParams(request);

    // Only handle when originalPathname is exactly '/'
    if (originalPathname !== '/') {
      // Debug log removed - too verbose for production
      return middleware(request, event, response);
    }

    // === 第二步：参数由 getRequiredParams 保证存在 ===

    // === 第三步：🛑 重写到实际首页内容并中断链路 ===
    const rewriteUrl = buildInternalUrl(request, '/home');

    logger.info('Home page rewritten', {
      middleware: 'Home',
      from: '/',
      to: rewriteUrl.pathname,
    });

    // 🚀 关键：累积前面的响应修改（cookies, headers等）
    return createRewriteWithState(response, rewriteUrl);
  };
}
