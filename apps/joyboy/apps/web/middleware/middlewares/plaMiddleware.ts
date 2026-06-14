import { CustomMiddleware } from '../lib/chain';
import { getRequiredParams, createRedirectWithState } from '../lib/utils';
import { logger } from '@castlery/observability/server';

/**
 * 🛍️ PLA (Product Listing & Analytics) 重定向中间件
 *
 * 功能：
 * - 检测 PLA 相关的路径请求
 * - 将 /pla/* 路径重定向到 /products/* 路径
 * - 保留所有查询参数
 *
 * 路径处理逻辑：
 * - 检测 /pla/* 开头的路径
 * - 301 重定向到 /products/* 格式
 * - 保持所有查询参数不变
 *
 * 示例：
 * /us/pla/owen-build-your-own-living-room-set?material=pearl_beige
 * → /us/products/owen-build-your-own-living-room-set?material=pearl_beige
 *
 * 🎯 设计优势：
 * - 📋 从 headers 读取参数
 * - 🛑 使用 301 永久重定向
 * - 🔗 保留所有查询参数
 */
export function plaMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // === 第一步：获取类型安全的参数 ===
    const { originalPathname, region } = getRequiredParams(request);

    // 仅处理 PLA 相关路径
    if (!originalPathname || !originalPathname.startsWith('/pla/')) {
      return middleware(request, event, response);
    }

    // === 第二步：构建重定向目标 URL ===
    // 将 /pla/xxx 替换为 /products/xxx
    const targetPath = originalPathname.replace('/pla/', '/products/');
    const redirectUrl = new URL(`/${region}${targetPath}`, request.url);

    // 保留所有查询参数（通过 request.url 构造自动保留）
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    // 获取查询参数用于渠道追踪
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const originalSearch = request.nextUrl.search || '';
    const redirectSearch = redirectUrl.search || '';

    logger.warn('PLA page redirected to products', {
      middleware: 'PLA',
      from: originalPathname,
      to: redirectUrl.pathname,
      ...(Object.keys(searchParams).length > 0 && { searchParams }), // 只在有参数时记录
      fromUrl: `${originalPathname}${originalSearch}`, // 完整的原始URL
      toUrl: `${redirectUrl.pathname}${redirectSearch}`, // 完整的目标URL
    });

    // === 第三步：返回 301 永久重定向 ===
    return createRedirectWithState(response, redirectUrl, 301);
  };
}
