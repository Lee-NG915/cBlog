import { NextResponse } from 'next/server';
import { CustomMiddleware } from '../lib/chain';
import { buildInternalUrl, getRequiredParams, createRewriteWithState } from '../lib/utils';
import { logger } from '@castlery/observability/server';

/**
 * 🛒 Rewrite 兜底中间件工厂
 *
 * 作为链式中间件的最后一个，提供兜底的 URL 规范化处理
 * 如果前面的中间件都没有中断链路，这里将进行最终的 rewrite
 *
 * 🎯 设计优势：
 * - 🛡️ 兜底保障：确保所有请求都被正确重写到内部格式
 * - 🔄 响应累积：使用前面中间件累积的 response 状态
 * - 📋 Headers 传递：自动传递所有累积的 headers 修改
 * - 🚀 简化设计：无需复杂的状态管理，直接处理 rewrite
 */
export function rewriteMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // === 第一步：获取类型安全的参数 ===
    const { originalPathname } = getRequiredParams(request);

    if (!originalPathname) {
      logger.warn('Missing x-original-pathname header', {
        middleware: 'Rewrite',
      });
      // 直接返回，不进行 rewrite
      return middleware(request, event, response);
    }

    // === 第二步：🛒 兜底 Rewrite - 将用户路径转换为内部格式 ===
    const rewriteUrl = buildInternalUrl(request, originalPathname);

    // Debug log removed - too verbose for production
    // logger.debug('Fallback rewrite', { from: originalPathname, to: rewriteUrl.pathname });

    // === 第三步：🚀 关键 - 累积所有前面中间件的修改 ===
    // 这包括 cookies, response headers 等所有状态
    return createRewriteWithState(response, rewriteUrl);
  };
}
