import { CustomMiddleware } from '../lib/chain';
import {
  getMiddlewareParams,
  shouldSkipPlpClp,
  buildInternalUrl,
  createCategoryRewriteResponse,
  createRedirectWithState,
} from '../lib/utils';
import { fetchCategories, CategoryData } from '../lib/apiClient';
import { logger } from '@castlery/observability/server';

export function categoryMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // Skip for paths that don't need category processing
    if (shouldSkipPlpClp(request)) {
      return middleware(request, event, response);
    }

    try {
      const { originalPathname, region } = getMiddlewareParams(request);
      // Prefer forwarded headers (behind proxies/CDN) and fallback to origin

      // Fetch categories for the specific region
      const categoriesResponse = await fetchCategories();

      if (categoriesResponse.error) {
        logger.warn('Categories API failed', {
          middleware: 'Category',
          error: categoriesResponse.error,
        });
      }

      const categories: CategoryData[] = categoriesResponse.data || [];

      // 1. 当前URL - 优先检查是否匹配当前分类
      const matchedCategories = categories.filter((category: CategoryData) => {
        // Exact match
        if (category.url === originalPathname) return true;

        // Prefix match (for category pages with sub-paths)
        if (originalPathname.startsWith(category.url + '/')) return true;

        return false;
      });

      if (matchedCategories.length > 0) {
        // If there are multiple matches, prefer the one without outdatedUrls (current/active category)
        // or the first one if all have outdatedUrls
        const matchedCategory =
          matchedCategories.find((cat) => !cat.outdatedUrls || cat.outdatedUrls.length === 0) || matchedCategories[0];

        // Build rewrite URL using buildInternalUrl for correct path format
        const rewriteUrl = buildInternalUrl(request, `/categories/${matchedCategory.permalink}`);

        // Copy all search params to the rewrite URL
        request.nextUrl.searchParams.forEach((value, key) => {
          rewriteUrl.searchParams.set(key, value);
        });

        logger.info('Category page rewritten', {
          middleware: 'Category',
          from: originalPathname,
          to: rewriteUrl.pathname,
          category: matchedCategory.permalink,
          totalMatches: matchedCategories.length,
        });

        // Return rewrite response with headers to interrupt the chain
        return createCategoryRewriteResponse(response, rewriteUrl);
      }

      // 2. 历史URL 301重定向到当前URL - 只有当前URL不匹配时才检查重定向
      for (const category of categories) {
        if (category.outdatedUrls?.includes(originalPathname)) {
          // 检查重定向目标是否和当前URL相同，避免无限重定向
          if (category.url === originalPathname) {
            logger.warn('Skipping redirect: target URL matches current URL', {
              middleware: 'Category',
              url: originalPathname,
              permalink: category.permalink,
            });
            continue;
          }

          const redirectUrl = new URL(`${region}${category.url}`, request.nextUrl.origin);
          request.nextUrl.searchParams.forEach((value, key) => {
            redirectUrl.searchParams.set(key, value);
          });
          logger.info('Category URL redirected', {
            middleware: 'Category',
            from: originalPathname,
            to: redirectUrl.pathname,
            type: '301',
          });
          return createRedirectWithState(response, redirectUrl, 301);
        }
      }

      // 3. 其他情况，走下一个中间件（最终404）
      return middleware(request, event, response);
    } catch (error) {
      logger.error('Category middleware error', {
        middleware: 'Category',
        error: error instanceof Error ? error.message : String(error),
      });
      return middleware(request, event, response);
    }
  };
}
