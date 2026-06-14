import { sbApiClient } from '@castlery/modules-cms-components';
import { EcEnv } from '@castlery/config';
import { ISbStoryData } from '@storyblok/react';
import type { SaleInfo, SaleType } from '@castlery/types';
import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse } from '../utils';
import { logger } from '@castlery/observability/server';

// Route Segment Config - Next.js caching configuration
// Route 层缓存组合后的数据，Service 层缓存原始 CMS 数据
// 两层缓存各司其职：Service 层处理容错，Route 层减少组合计算
export const revalidate = 300;

const saleTypeMap: Record<SaleType, SaleType> = {
  regular: 'regular',
  seo: 'seo',
  visual: 'visual',
  'visual-seo': 'visual-seo',
};

/**
 * GET /api/sales
 * Returns sale page URLs in Microsoft API Guidelines format
 *
 * @description Provides URLs for both traditional and visual sale pages
 * @returns {ApiSuccessResponse<SaleUrl[]>} Collection of sale page URLs
 */
export async function GET(request: NextRequest) {
  try {
    const country = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase();

    const [traditionalSalePagesResult, visualSaleStoriesResult] = await Promise.allSettled([
      sbApiClient.getSalePages(),
      sbApiClient.getVisualSalePages(),
    ]);

    // 严格的数据完整性检查：只要有一个数据源失败就返回错误
    // 这样确保缓存的数据一定是完整的，避免缺失关键 sale pages 导致页面 404
    if (traditionalSalePagesResult.status === 'rejected') {
      logger.error('Traditional sale pages fetch failed', {
        error: traditionalSalePagesResult.reason,
      });
      return createApiErrorResponse('ServiceUnavailable', 'Failed to fetch traditional sale pages', {
        status: 503,
        innerError: traditionalSalePagesResult.reason,
      });
    }

    if (visualSaleStoriesResult.status === 'rejected') {
      logger.error('Visual sale pages fetch failed', {
        error: visualSaleStoriesResult.reason,
      });
      return createApiErrorResponse('ServiceUnavailable', 'Failed to fetch visual sale pages', {
        status: 503,
        innerError: visualSaleStoriesResult.reason,
      });
    }

    const allUrls: SaleInfo[] = [];

    // Process traditional sale pages
    const traditionalUrls = traditionalSalePagesResult.value
      .filter((page) => page.url)
      .map((page) => ({
        url: normalizeUrl(page.url),
        uuid: page._uid,
        type: saleTypeMap[page.isSeoPage ? 'seo' : 'regular'],
        outdatedUrls: page.outdatedUrls ? page.outdatedUrls.split(',') : [],
        query_deliver_before: page.query_deliver_before,
      }));
    allUrls.push(...traditionalUrls);

    // Process visual sale pages
    const visualSaleUrls = visualSaleStoriesResult.value
      .map((story) => {
        const url = extractStoryUrl(story, country);
        if (!url) return null;
        return {
          url: url,
          uuid: story.uuid,
          type: saleTypeMap[story.content.is_seo_page ? 'visual-seo' : 'visual'],
          outdatedUrls: story.content.outdated_urls ? story.content.outdated_urls.split(',') : [],
          query_deliver_before: story.content.query_deliver_before,
        };
      })
      .filter(Boolean) as SaleInfo[];
    allUrls.push(...visualSaleUrls);

    // Return standardized API response with Microsoft API Guidelines format
    return createApiListResponse(allUrls);
  } catch (error) {
    logger.error('Error fetching sales data', { error });

    return createApiErrorResponse('InternalServerError', 'An unexpected error occurred while fetching sales data', {
      innerError: error,
      status: 500,
    });
  }
}

/**
 * 标准化 URL 格式，确保与 originalPathname 对齐
 * - 以 / 开头
 * - 去除尾部 /
 * - 去除查询参数
 * - 转为小写
 */
function normalizeUrl(url: string): string {
  if (!url) return '/';

  // 去除查询参数
  const questionMarkIndex = url.indexOf('?');
  if (questionMarkIndex !== -1) {
    url = url.substring(0, questionMarkIndex);
  }

  // 确保以 / 开头
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }

  // 去除尾部 /（除非是根路径）
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url.toLowerCase();
}

function extractStoryUrl(story: ISbStoryData, country: string | undefined): string | null {
  const path = story.path || story.slug;
  if (!path) return null;

  let url = path;
  if (country && story.full_slug.startsWith(`${country}/`)) {
    if (path.startsWith(`${country}/`)) {
      url = path.replace(`${country}/`, '');
    }
  }
  return normalizeUrl(url);
}
