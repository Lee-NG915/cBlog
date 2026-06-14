import { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';
import { daysToDate } from '@castlery/modules-cms-services';
// 简单的 uniqBy 实现，避免依赖 lodash
function uniqBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Sale page data structure
 * Simplified to only include fields needed for leadtime filters generation
 */
export interface SalePageData {
  query_deliver_before?: Array<{
    deadline: string;
    filter_presentation: string;
  }>;
}

/**
 * Generate leadtime filters from sale pages data
 * This replicates the logic from onepiece/src/containers/Category/components/Filters.js
 *
 * @param salePages - Array of sale page data from Storyblok (already filtered for expired pages)
 * @returns Array of numeric menu items for leadtime filters
 */
export function generateLeadtimeFilters(salePages: SalePageData[]): NumericMenuConnectorParamsItem[] {
  if (!salePages || salePages.length === 0) {
    return [];
  }

  // Filter sale pages that have delivery deadline
  // Note: Expired pages are already filtered at the data source layer (sbService)
  const leadtimeFilters = salePages
    .filter((page) => page.query_deliver_before && page.query_deliver_before.length > 0)
    .map((page) => {
      const deliverBefore = page.query_deliver_before?.[0];
      if (!deliverBefore) return null;

      // 跳过没有 filter_presentation 的项
      if (!deliverBefore.filter_presentation) {
        return null;
      }

      const endDays = daysToDate(deliverBefore.deadline);

      // 过滤掉不合理的数据：end 必须大于 0
      if (endDays <= 0) {
        return null;
      }

      const filterItem: NumericMenuConnectorParamsItem = {
        label: deliverBefore.filter_presentation,
        end: endDays,
      };
      return filterItem;
    })
    .filter((filter): filter is NumericMenuConnectorParamsItem => filter !== null);

  // Remove duplicates based on label
  const uniqueFilters = uniqBy(leadtimeFilters, (filter: NumericMenuConnectorParamsItem) => filter.label);

  return uniqueFilters;
}

/**
 * Check if leadtime filters should be enabled
 * This can be extended to check feature flags or other conditions
 */
export function shouldShowLeadtimeFilters(leadtimeFilters: NumericMenuConnectorParamsItem[]): boolean {
  return leadtimeFilters.length > 0;
}
