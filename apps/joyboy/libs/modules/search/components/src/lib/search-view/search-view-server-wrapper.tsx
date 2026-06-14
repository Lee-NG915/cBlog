import { SearchView, SearchViewProps } from './search-view-client';
import type { ElasticsearchQuery } from 'searchkit';
import { FACET_ATTRIBUTES_CONFIG } from '../config/facet-attributes.config';
import { fetchFlatCategories, getFilterOrder, type FilterOrderResponse } from '@castlery/modules-cms-domain/server';
import { generateLeadtimeFilters } from '../utils/leadtime-filters';
import { getLeadTimeGroups } from '../config';
import { sortLeadTimeItems } from '../utils/leadtime-sort';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { cookies } from 'next/headers';
import type { DyCookies, DyRankingContext } from '../api/search/dy-ranking.utils';
import { FACET_ATTRIBUTE } from '../config/facet-attributes.config';
import type { FilterOrdersData } from '../config/search-context';
import { FeatureManager, FeatureName } from '@castlery/monorepo-features';
import { logger } from '@castlery/observability/server';
import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';
import { EcEnv } from '@castlery/config';

// Helper to check if running in POS environment
const isPOSEnvironment = () => EcEnv.NEXT_PUBLIC_CHANNEL === 'POS';

// Define the facet configuration type to match the actual structure
type FacetConfig = {
  attribute: string;
  field: string;
  type: string;
  nestedPath?: string;
};

// Define the same type as in SearchView for consistency
type SearchRuleContexts = {
  dyRanking?: DyRankingContext;
  queryString?: string;
  baseFilters?: ElasticsearchQuery[];
  categoryPermalink?: string; // For category-based base filters
  currentZipcode?: string | null;
  queryDeliverBeforeDeadline?: string | null;
};

export type SearchViewServerWrapperProps = Omit<SearchViewProps, 'categoryFilter'> & {
  queryString?: string;
  categoryFacetFilter?: string[]; // 可选：要显示的特定分类permalink列表，用于限制分类筛选器显示范围
  hideCategoryRefinement?: boolean; // 是否隐藏分类筛选器，默认为false
  indexName?: string;
  categoryPermalink?: string; // 用于获取 category context
  currentUrl?: string; // 用于 DY ranking 的 page location
  baseFilters?: ElasticsearchQuery[]; // Keep baseFilters as input parameter
  queryDeliverBeforeDeadline?: string | null; // For deliver before filters
  breadcrumbs?: Array<{ name: string; url?: string }>; // Breadcrumb data for DY ranking context
  dyApiPreview?: string; // DY API preview ID for testing campaigns (from URL param)
};

/**
 * Get DY cookies from server-side persistence
 * POS 环境下不需要 DY cookies，直接返回空对象以提升性能
 */
function getDyCookiesFromServer(cookies: any): DyCookies {
  // Skip DY cookies in POS environment - not needed for internal staff usage
  if (isPOSEnvironment()) {
    logger.debug('Skipping DY cookies extraction in POS environment', {
      context: 'dy_cookies_extraction',
    });
    return {
      dyid: '',
      dyidServer: '',
      dySession: '',
      dyNewUser: '',
      dyPageLocation: '',
      ipAddress: '',
    };
  }

  try {
    const persistence = makePersistenceHandles({ cookies });

    return {
      dyid: persistence.dyid.getItem() || '',
      dyidServer: persistence.dyidServer.getItem() || '',
      dySession: persistence.dySession.getItem() || '',
      dyNewUser: persistence.dyNewUser.getItem() || '',
      dyPageLocation: persistence.dyPageLocation.getItem() || '',
      ipAddress: persistence.ipAddress.getItem() || '',
    };
  } catch (error) {
    logger.error('Error getting DY cookies from server', {
      error: error instanceof Error ? error.message : String(error),
      context: 'dy_cookies_extraction',
    });
    return {
      dyid: '',
      dyidServer: '',
      dySession: '',
      dyNewUser: '',
      dyPageLocation: '',
      ipAddress: '',
    };
  }
}

/**
 * Get current user's zipcode from server-side persistence
 */
function getCurrentZipcodeFromServer(cookies: any): string | null {
  try {
    const featureManager = FeatureManager.getInstance();
    const isQuickshipFeatureEnabled = featureManager.isFeatureEnabled(FeatureName.QUICKSHIP);
    if (!isQuickshipFeatureEnabled) {
      return null;
    }

    const persistence = makePersistenceHandles({ cookies });
    const webCityData = persistence.webCity.getItem();
    if (webCityData) {
      const cityInfo = JSON.parse(webCityData);
      return cityInfo.zipcode || null;
    }
    return null;
  } catch (error) {
    logger.error('Error getting zipcode from server', {
      error: error instanceof Error ? error.message : String(error),
      context: 'zipcode_extraction',
    });
    return null;
  }
}

/**
 * 从分类数据中提取分类筛选器列表
 * 优化：重用已获取的分类数据，避免重复API调用
 */
function extractCategoryFilter(
  categoriesData: { permalink: string; name: string }[],
  categoryFacetFilter?: string[],
  hideCategoryRefinement?: boolean
): string[] | undefined {
  if (hideCategoryRefinement) {
    return undefined;
  }

  if (categoryFacetFilter) {
    return categoryFacetFilter;
  }

  // 从已获取的分类数据中提取所有permalink
  return categoriesData?.map((cat) => cat.permalink) || [];
}

/**
 * 从 breadcrumbs 数据中提取 DY ranking 的分类上下文
 * 返回完整的面包屑路径，例如 ['Sofas', 'Leather Sofas']
 */
function extractCategoryContext(breadcrumbs?: Array<{ name: string; url?: string }>): string[] | null {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  // 提取所有 breadcrumb 的名称，与客户端 DYResourceTag 保持一致
  return breadcrumbs.filter((item) => item.name).map((item) => item.name);
}

/**
 * 统一的分类数据获取和处理函数
 * 返回完整的分类数据，用于多种用途
 * 添加错误处理，确保服务端渲染不会因为API失败而崩溃
 */
async function getCategoriesData() {
  try {
    const categories = await fetchFlatCategories();
    return (
      categories?.map((category) => ({
        permalink: category.permalink,
        name: category.nameWithAll || category.name,
      })) || []
    );
  } catch (error) {
    logger.error('Failed to fetch categories data in SearchViewServerWrapper', {
      error: error instanceof Error ? error.message : String(error),
      context: 'search_view_server_wrapper',
    });
    return []; // 返回空数组而不是null，避免后续处理错误
  }
}

/**
 * 获取 Sale Pages 数据用于动态 leadtime filters
 * 统一调用 /api/sales 接口，避免重复的 CMS 调用和数据处理
 * POS 环境下跳过调用以提升性能
 */
async function getSalePagesData(): Promise<import('../utils/leadtime-filters').SalePageData[]> {
  // Skip sale pages fetch in POS environment - not needed for internal staff
  if (isPOSEnvironment()) {
    logger.debug('Skipping sale pages fetch in POS environment', {
      context: 'sale_pages_fetch',
    });
    return [];
  }

  try {
    const url = `${EcEnv.APP_API_BASE_URL}/sales`;
    const response = await fetch(url, {
      credentials: 'omit',
      next: {
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      },
    });

    if (!response.ok) {
      logger.warn('Sales API returned error status', {
        status: response.status,
        statusText: response.statusText,
        url,
        context: 'sale_pages_fetch',
      });
      return [];
    }

    const data = await response.json();

    // 检查返回的数据格式（Microsoft API Guidelines format）
    if (!data.value || !Array.isArray(data.value)) {
      logger.warn('Sales API returned invalid data format', {
        url,
        hasValue: !!data.value,
        valueType: typeof data.value,
        context: 'sale_pages_fetch',
      });
      return [];
    }

    // 转换为 SalePageData 格式（只需要 query_deliver_before 字段）
    const salePages = data.value.map((sale: any) => ({
      query_deliver_before: sale.query_deliver_before,
    }));

    return salePages;
  } catch (error) {
    logger.error('Error fetching sale pages for leadtime filters', {
      error: error instanceof Error ? error.message : String(error),
      context: 'sale_pages_fetch',
    });
    return [];
  }
}

// 需要自定义排序的筛选器列表
const SORTABLE_FACETS = [
  FACET_ATTRIBUTE.rug_size,
  FACET_ATTRIBUTE.fabric_type,
  FACET_ATTRIBUTE.fabric_feature,
] as const;

/**
 * 优化的筛选器数据获取函数
 * 1. 使用常量避免拼写错误
 * 2. 优化数据格式，便于组件使用
 * 3. 易于扩展新的筛选器
 * POS 环境下跳过 CMS 调用以提升性能
 */
async function getFilterOrdersData(): Promise<FilterOrdersData> {
  // Skip CMS-based filter orders in POS environment - use default sorting instead
  if (isPOSEnvironment()) {
    logger.debug('Skipping filter orders fetch in POS environment', {
      context: 'filter_orders_fetch',
    });
    return {};
  }

  try {
    // 并行获取所有筛选器排序数据
    const filterPromises = SORTABLE_FACETS.map(async (facetAttribute) => {
      // 直接使用 facetAttribute 作为 property 名称
      const data = await getFilterOrder({ property: facetAttribute as any });
      return {
        facetAttribute,
        orderValues: data?.values?.map((item) => item.value) || [],
      };
    });

    const results = await Promise.all(filterPromises);

    // 转换为易于使用的格式
    const filterOrdersData: FilterOrdersData = {};
    results.forEach(({ facetAttribute, orderValues }) => {
      if (orderValues.length > 0) {
        filterOrdersData[facetAttribute] = orderValues;
      }
    });

    return filterOrdersData;
  } catch (error) {
    logger.error('Failed to fetch filter orders', {
      error: error instanceof Error ? error.message : String(error),
      context: 'filter_orders_fetch',
    });
    return {};
  }
}

/**
 * 优化的 leadtime filters 数据获取和处理函数
 * 参考 filterOrdersData 的处理模式
 * POS 环境下只返回静态数据，跳过 CMS Sale Pages 调用以提升性能
 */
async function getLeadTimeItemsData(): Promise<
  import('instantsearch.js/es/connectors/numeric-menu/connectNumericMenu').NumericMenuConnectorParamsItem[]
> {
  // POS environment only needs static leadtime groups - skip dynamic sale pages
  if (isPOSEnvironment()) {
    logger.debug('Using static leadtime groups in POS environment', {
      context: 'leadtime_items_fetch',
    });
    return getLeadTimeGroups();
  }

  try {
    // 获取 sale pages 数据
    const salePages = await getSalePagesData();

    // 获取静态 leadtime groups
    const staticLeadTimeGroups = getLeadTimeGroups();

    // 生成动态 leadtime filters
    const dynamicLeadTimeGroups = generateLeadtimeFilters(salePages);

    // 合并并去重（动态优先，然后是静态）
    const combinedLeadTimeItems = [...dynamicLeadTimeGroups, ...staticLeadTimeGroups];

    // 统一过滤：去重 + 过滤无效数据
    const validAndUniqueItems = combinedLeadTimeItems
      .filter((group) => {
        // 过滤掉无效的 leadtime items
        if (group.end !== undefined && group.end <= 0) {
          logger.warn('Filtering out invalid static leadtime filter', {
            label: group.label,
            end: group.end,
            context: 'leadtime_filter_validation',
          });
          return false;
        }
        return true;
      })
      .filter((group, index, self) => {
        // 去重：保留第一个出现的（动态优先）
        return index === self.findIndex((g) => g.label === group.label);
      });

    // 在数据生成的源头进行排序，后续所有使用的地方都不需要再排序
    const sortedLeadTimeItems = sortLeadTimeItems(validAndUniqueItems);

    return sortedLeadTimeItems;
  } catch (error) {
    logger.error('Failed to fetch leadtime items', {
      error: error instanceof Error ? error.message : String(error),
      context: 'leadtime_items_fetch',
    });
    return getLeadTimeGroups(); // 回退到静态数据
  }
}

export async function SearchViewServerWrapper({
  queryString,
  categoryFacetFilter,
  hideCategoryRefinement = false,
  baseFilters = [],
  indexName = 'web_product',
  categoryPermalink,
  currentUrl,
  queryDeliverBeforeDeadline,
  breadcrumbs,
  dyApiPreview,
  ...props
}: SearchViewServerWrapperProps) {
  const startTime = Date.now();
  const isPOS = isPOSEnvironment();

  logger.info('SearchViewServerWrapper started', {
    isPOS,
    indexName,
    hasCategoryPermalink: !!categoryPermalink,
    hasQueryString: !!queryString,
    context: 'search_view_server_wrapper',
  });

  // Get DY cookies and zipcode synchronously (no async operation needed)
  const dyCookies = getDyCookiesFromServer(cookies);
  const currentZipcode = getCurrentZipcodeFromServer(cookies);

  // Execute async operations in parallel with proper error handling
  // 优化：需要三个API调用，获取分类数据、筛选器排序数据和leadtime items数据
  let categoriesData: { permalink: string; name: string }[] | undefined;
  let filterOrdersData: FilterOrdersData | undefined;
  let leadTimeItems: NumericMenuConnectorParamsItem[] | undefined;

  try {
    const results = await Promise.allSettled([
      // 获取分类数据（用于标签转换和多种用途）
      getCategoriesData(),
      // 获取筛选器排序数据
      getFilterOrdersData(),
      // 获取合并后的 leadtime items（包含动态和静态数据）
      getLeadTimeItemsData(),
    ]);

    // Extract results with fallback handling
    categoriesData = results[0].status === 'fulfilled' ? results[0].value : undefined;
    filterOrdersData = results[1].status === 'fulfilled' ? results[1].value : undefined;
    leadTimeItems = results[2].status === 'fulfilled' ? results[2].value : undefined;

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const apiNames = ['getCategoriesData', 'getFilterOrdersData', 'getLeadTimeItemsData'];
        logger.error('SearchViewServerWrapper API call failed', {
          api: apiNames[index],
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          context: 'search_view_server_wrapper',
        });
      }
    });
  } catch (error) {
    // This should not happen with Promise.allSettled, but just in case
    logger.error('SearchViewServerWrapper unexpected error in Promise.allSettled', {
      error: error instanceof Error ? error.message : String(error),
      context: 'search_view_server_wrapper',
    });
  }
  // 从已获取的分类数据中派生其他数据，避免重复API调用
  const categoryFilter = extractCategoryFilter(categoriesData || [], categoryFacetFilter, hideCategoryRefinement);

  // 从 breadcrumbs 中提取 DY ranking context，与客户端保持一致
  const dyRankingContext = extractCategoryContext(breadcrumbs);

  // Create DY ranking context with raw queryString and baseFilters
  // Let route.ts handle all filter parsing and merging for consistency
  const ruleContexts: SearchRuleContexts = {
    dyRanking: {
      dyCookies,
      categoryContext: dyRankingContext,
      currentUrl: currentUrl || '',
      dyApiPreview, // Pass DY API preview ID for testing campaigns
    },
    // Pass raw queryString and baseFilters to route.ts for unified processing
    queryString: queryString || '',
    baseFilters: baseFilters,
    // Pass categoryPermalink for route.ts to generate category-based base filters
    categoryPermalink: categoryPermalink,
    // Pass current zipcode for quickship functionality
    currentZipcode,
    // Pass queryDeliverBeforeDeadline for route.ts to generate deliver before filters
    queryDeliverBeforeDeadline: queryDeliverBeforeDeadline,
  };

  const duration = Date.now() - startTime;
  logger.info('SearchViewServerWrapper completed', {
    isPOS,
    duration,
    hasCategoriesData: !!categoriesData && categoriesData.length > 0,
    hasFilterOrdersData: !!filterOrdersData && Object.keys(filterOrdersData).length > 0,
    hasLeadTimeItems: !!leadTimeItems && leadTimeItems.length > 0,
    context: 'search_view_server_wrapper',
  });

  return (
    <SearchView
      {...props}
      indexName={indexName}
      categoryFilter={categoryFilter} // 保持undefined，不转换为空数组
      categoriesData={categoriesData}
      filterOrdersData={filterOrdersData}
      ruleContexts={ruleContexts}
      categoryPermalink={categoryPermalink}
      leadTimeItems={leadTimeItems}
      enableSearchResultsLoadedTracking={props.enableSearchResultsLoadedTracking}
    />
  );
}
