import { CustomMiddleware } from '../lib/chain';
import {
  getMiddlewareParams,
  shouldSkipPlpClp,
  buildInternalUrl,
  createCategoryRewriteResponse,
  createRedirectWithState,
} from '../lib/utils';
import { fetchSales } from '../lib/apiClient';
import { SaleInfo } from '@castlery/types';
import { logger } from '@castlery/observability/server';

export function saleMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    if (shouldSkipPlpClp(request)) {
      return middleware(request, event, response);
    }

    try {
      const { originalPathname, region } = getMiddlewareParams(request);

      const salesResponse = await fetchSales();

      if (salesResponse.error) {
        logger.warn('Sales API failed', {
          middleware: 'Sale',
          error: salesResponse.error,
        });
      }

      const sales: SaleInfo[] = salesResponse.data || [];
      // 1. 历史URL 301重定向到当前URL
      for (const sale of sales) {
        if (sale.outdatedUrls?.includes(originalPathname)) {
          // 检查重定向目标是否和当前URL相同，避免无限重定向
          if (sale.url === originalPathname) {
            logger.warn('Skipping redirect: target URL matches current URL', {
              middleware: 'Sale',
              url: originalPathname,
              saleId: sale.uuid,
            });
            continue;
          }

          const redirectUrl = new URL(`${region}${sale.url}`, request.nextUrl.origin);
          request.nextUrl.searchParams.forEach((value, key) => {
            redirectUrl.searchParams.set(key, value);
          });
          logger.info('Sale URL redirected', {
            middleware: 'Sale',
            from: originalPathname,
            to: redirectUrl.pathname,
            type: '301',
          });
          return createRedirectWithState(response, redirectUrl, 301);
        }
      }

      // 2. 当前URL
      const matchedSale = sales.find((sale) => sale.url === originalPathname);
      if (matchedSale) {
        // TODO 过期的页面应该统一到一个中间件来处理
        // if (isExpired(matchedSale.published_at, matchedSale.ended_at)) {
        //   // 302重定向到/sale
        //   const destinationUrl = buildInternalUrl(request, '/sale');
        //   logger.info('302 Redirect for expired sale', {
        //     middleware: 'Sale',
        //     from: originalPathname,
        //     to: destinationUrl.pathname,
        //     saleId: matchedSale.uuid,
        //     publishedAt: matchedSale.published_at,
        //     endedAt: matchedSale.ended_at,
        //   });
        //   return NextResponse.redirect(destinationUrl, 302);
        // }
        // 未过期，rewrite到内部页面
        const rewritePath =
          matchedSale.type === 'visual' || matchedSale.type === 'visual-seo'
            ? `/sales/visual-sale/${matchedSale.uuid}`
            : `/sales/${matchedSale.uuid}`; // 'regular'和'seo'共用
        const rewriteUrl = buildInternalUrl(request, rewritePath);
        request.nextUrl.searchParams.forEach((value, key) => {
          rewriteUrl.searchParams.set(key, value);
        });
        logger.info('Sale page rewritten', {
          middleware: 'Sale',
          from: originalPathname,
          to: rewriteUrl.pathname,
          saleType: matchedSale.type,
        });
        return createCategoryRewriteResponse(response, rewriteUrl);
      }

      // 3. 其他情况，走下一个中间件（最终404）
      return middleware(request, event, response);
    } catch (error) {
      logger.error('Sale middleware error', {
        middleware: 'Sale',
        error: error instanceof Error ? error.message : String(error),
      });
      return middleware(request, event, response);
    }
  };
}
