import { CustomMiddleware } from '../lib/chain';
import { NextResponse } from 'next/server';
import { buildInternalUrl, getRequiredParams, createRewriteWithState } from '../lib/utils';
import { logger } from '@castlery/observability/server';
import { ROUTE_PATTERNS } from '../constants';

/**
 * 📋 Terms & Conditions 中间件工厂
 *
 * 功能：
 * - 检测 T&C 相关的路径请求
 * - 重写到统一的 TandC 页面
 * - 将匹配到的原始路径设置到 x-original-pathname header 中
 *
 * 路径处理逻辑：
 * - 检测 T&C 相关的路径（从 constants.ts 中定义的 ROUTE_PATTERNS）
 * - 重写到 /TandC 页面
 * - 保持原始路径信息供页面组件使用
 *
 * 🎯 设计优势：
 * - 📋 从 constants.ts 读取路由模式
 * - 🛑 直接返回 NextResponse.rewrite() 中断链路
 * - 🔄 统一处理所有 T&C 相关页面
 * - 📋 保持原始路径信息供 SEO 和页面逻辑使用
 */
export function termsAndConditionMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // === 第一步：获取类型安全的参数 ===
    const { originalPathname } = getRequiredParams(request);

    // === 第二步：检查是否为 T&C 相关路径 ===
    const tcRoutes = [
      ROUTE_PATTERNS.SALESANDREFUNDS,
      ROUTE_PATTERNS.PROMOTERMS,
      ROUTE_PATTERNS.WARRANTY,
      ROUTE_PATTERNS.TERMSOFUSE,
      ROUTE_PATTERNS.DELIVERY,
      ROUTE_PATTERNS.PRIVACYPOLICY,
      ROUTE_PATTERNS.ACCESSIBILITY,
    ];

    const isTcRoute = tcRoutes.some((route) => {
      if (!originalPathname) return false;
      // 对于 /delivery 路径，只匹配精确路径，避免拦截 /delivery-review
      if (route === ROUTE_PATTERNS.DELIVERY) {
        return originalPathname === route || originalPathname.startsWith(route + '/');
      }
      // 其他路径保持原有的 startsWith 逻辑
      return originalPathname.startsWith(route);
    });

    if (!isTcRoute) {
      // Debug log removed - too verbose for production
      return middleware(request, event, response);
    }

    // === 第三步：🛑 构建目标路径并重写 ===
    // 从原始路径中提取 slug
    const slug = originalPathname.replace(/^\//, ''); // 移除开头的斜杠
    const targetPath = `/TandC/${slug}`;

    logger.info('T&C page rewritten', {
      middleware: 'TermsAndCondition',
      from: originalPathname,
      to: targetPath,
    });

    // 重写到目标 TandC 页面
    const rewriteUrl = buildInternalUrl(request, targetPath);

    // 🚀 关键：累积前面的响应修改，并保持原始路径信息
    return createRewriteWithState(response, rewriteUrl, {
      'x-original-pathname': originalPathname,
    });
  };
}
