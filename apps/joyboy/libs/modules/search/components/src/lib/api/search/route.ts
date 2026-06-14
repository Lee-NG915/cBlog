import 'server-only';
import { EcEnv } from '@castlery/config';
import API from '@searchkit/api';
import { NextRequest, NextResponse } from 'next/server';
import type { SearchResponse, SearchHit, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types';
import { addNestedFilterInnerHitsNames } from './utils';
import { FACET_ATTRIBUTES_CONFIG, FACET_ATTRIBUTE } from '../../config/facet-attributes.config';
import { FacetWidgetType, FacetWidgetTypeUtils } from '../../config/facet-widget-types.config';
import { shouldApplyDyRanking, applyDyRanking } from './dy-ranking.utils';
import { processSearchResponseWithVariantFiltering } from './variants-filter.utils';
import { getInventoryRegionCodeByZipcode } from '@castlery/modules-search-domain';
import { logger } from '@castlery/observability/server';
import { convertDeadlineToLeadTimeFilter } from '../../utils/deliver-before-filters';
import * as Sentry from '@sentry/nextjs';
import { SEARCH_SORTING_CONFIG, isValidIndexName } from './search-settings.config';

// Product name phrases that should be boosted above category matches when the query contains them
const BOOSTED_NAME_PHRASES = ['sofa bed'];

// Define types for SPU (Standard Product Unit) data
// SpuSource represents the structure of the main documents (_source field)
type SpuSource = Record<string, any>; // Replace 'any' with a more specific type if available

// Reinstating the InnerHitCollection type definition, which reflects the structure
// implied by the linter error (SearchInnerHitsResult containing SearchHitsMetadata).
// This structure is { hits: { hits: [...] } } for each named inner hit.
type InnerHitCollection<TDoc = any> = {
  hits: {
    // This object corresponds to what the linter calls 'SearchHitsMetadata'
    total?: SearchTotalHits | number;
    max_score?: number | null;
    hits: Array<SearchHit<TDoc>>; // This is the actual array of inner documents
  };
};

const apiClient = API(
  {
    connection: {
      host: EcEnv.ELASTICSEARCH_HOST,
      auth: {
        username: EcEnv.ELASTICSEARCH_USERNAME,
        password: EcEnv.ELASTICSEARCH_PASSWORD,
      },
    },

    search_settings: {
      // getQuery 那里自定义了
      search_attributes: [],
      // Configure result attributes
      result_attributes: [
        'name',
        'slug',
        'product_type',
        'id',
        // 'categories',
        // 'category_count',
        // 'images',
        // 'price',
        'rank',
        // 'swatches',
        'taxons',
        // 'styles',
        // 'variants',
        // 'variants.properties',
        // 'variants.option_values',
        'variants.id',
        'variants.tags',
        'variants.color',
        'variants.lead_time',
        'variants.lead_time_presentation',
        'variants.in_stock_regions',
        'variants.life_style_image',
        'variants.badges',
        'variants.price',
        'variants.list_price',
        'variants.product_short_description',
        'variants.sku',
        'variants.name',
        'variants.images',
        'variants.option_values',
        'variants.bed_frame_size',
      ],
      // 🔧 使用统一的排序配置（Single Source of Truth）
      // 从 search-settings.config.ts 导入，确保客户端和服务端一致
      sorting: SEARCH_SORTING_CONFIG as any,
      // Configure facet attributes
      // The order of this array determines the order of facets in the UI
      facet_attributes: FACET_ATTRIBUTES_CONFIG,
    },
  }
  // ,
  // {
  //   debug: EcEnv.NODE_ENV === 'development',
  // }
);

const enableProxy = false;

/**
 * 检查是否为 quickship 标记
 */
function isQuickshipMarker(item: any): boolean {
  return typeof item === 'string' && item.includes('in_stock_regions:__QUICKSHIP_ENABLED__');
}

/**
 * 检查过滤器是否包含 quickship 标记
 */
function hasQuickshipMarker(filter: any): boolean {
  if (Array.isArray(filter)) {
    return filter.some(isQuickshipMarker);
  }
  return isQuickshipMarker(filter);
}

/**
 * 移除过滤器中的 quickship 标记
 */
function removeQuickshipMarkers(filters: any[]): any[] {
  return filters
    .map((filter) => {
      if (Array.isArray(filter)) {
        const cleanedItems = filter.filter((item) => !isQuickshipMarker(item));
        return cleanedItems.length > 0 ? cleanedItems : null;
      }
      return isQuickshipMarker(filter) ? null : filter;
    })
    .filter((f) => f !== null);
}

/**
 * 转换 quickship 标记为实际的 inventory region code
 */
async function convertQuickshipMarker(currentZipcode: string | null): Promise<string | null> {
  if (!currentZipcode) {
    throw new Error('No zipcode provided for quickship filter');
  }

  const startTime = Date.now();
  logger.info('Starting quickship marker conversion', {
    zipcode: currentZipcode,
    context: 'quickship_processing',
    timestamp: new Date().toISOString(),
  });

  try {
    // Add timeout wrapper for the inventory region code fetch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Inventory region fetch timeout after 15 seconds for zipcode: ${currentZipcode}`));
      }, 15000); // 15 second timeout
    });

    const inventoryRegionCode = await Promise.race([getInventoryRegionCodeByZipcode(currentZipcode), timeoutPromise]);

    const duration = Date.now() - startTime;

    if (!inventoryRegionCode) {
      logger.error('No inventory region code returned from API', {
        zipcode: currentZipcode,
        duration,
        context: 'quickship_processing',
      });
      throw new Error('No inventory region code returned from API');
    }

    const result = `in_stock_regions:${inventoryRegionCode}`;
    logger.info('Quickship marker successfully converted', {
      zipcode: currentZipcode,
      inventoryRegionCode,
      result,
      duration,
      context: 'quickship_processing',
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Failed to convert quickship marker', {
      zipcode: currentZipcode,
      error: errorMessage,
      duration,
      errorType: error?.constructor?.name,
      context: 'quickship_processing',
    });

    // Enhanced error analysis for debugging
    if (errorMessage.includes('timeout')) {
      logger.error('Timeout detected in quickship conversion', {
        zipcode: currentZipcode,
        duration,
        context: 'quickship_timeout',
      });
    } else if (errorMessage.includes('502')) {
      logger.error('502 Bad Gateway detected in quickship conversion', {
        zipcode: currentZipcode,
        duration,
        context: 'quickship_502_error',
      });
    } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      logger.error('Network error detected in quickship conversion', {
        zipcode: currentZipcode,
        duration,
        context: 'quickship_network_error',
      });
    }

    throw error;
  }
}

/**
 * 处理单个过滤器项
 */
async function processFilterItem(item: any, currentZipcode: string | null): Promise<string | null> {
  if (isQuickshipMarker(item)) {
    return await convertQuickshipMarker(currentZipcode);
  }
  return item;
}

/**
 * 处理过滤器组（带错误回退）
 */
async function processFilterGroup(filter: any, currentZipcode: string | null): Promise<any> {
  if (Array.isArray(filter)) {
    // 处理数组过滤器
    try {
      const processedItems = await Promise.all(filter.map((item) => processFilterItem(item, currentZipcode)));
      const validItems = processedItems.filter((item): item is string => item !== null);
      return validItems.length > 0 ? validItems : null;
    } catch (error) {
      // 回退：移除 quickship 标记，保留其他项
      logger.warn('Array filter processing failed, applying fallback', {
        error: error instanceof Error ? error.message : String(error),
        originalFilterCount: Array.isArray(filter) ? filter.length : 0,
        context: 'quickship_processing',
      });
      const fallbackItems = filter.filter((item) => !isQuickshipMarker(item));
      return fallbackItems.length > 0 ? fallbackItems : null;
    }
  } else {
    // 处理单个过滤器
    try {
      return await processFilterItem(filter, currentZipcode);
    } catch (error) {
      // 回退：如果是 quickship 标记则移除，否则保留
      logger.warn('Single filter processing failed, applying fallback', {
        error: error instanceof Error ? error.message : String(error),
        isQuickshipMarker: isQuickshipMarker(filter),
        context: 'quickship_processing',
      });
      return isQuickshipMarker(filter) ? null : filter;
    }
  }
}

/**
 * 处理 quickship 筛选器，将 __QUICKSHIP_ENABLED__ 转换为实际的 inventory region code
 * 优化版本：更清晰的结构，更好的错误处理，减少重复代码
 */
async function processQuickshipFilters(facetFilters: any[], currentZipcode: string | null): Promise<any[]> {
  // 输入验证
  if (!Array.isArray(facetFilters)) {
    logger.warn('Invalid facetFilters input, expected array', {
      receivedType: typeof facetFilters,
      context: 'quickship_processing',
    });
    return [];
  }

  // 早期返回：如果没有 quickship 过滤器，直接返回原始过滤器
  const hasQuickshipFilter = facetFilters.some(hasQuickshipMarker);
  if (!hasQuickshipFilter) {
    return facetFilters;
  }

  logger.info('Starting quickship filters processing', {
    zipcode: currentZipcode,
    filterCount: facetFilters.length,
    context: 'quickship_processing',
  });

  try {
    // 并行处理所有过滤器组，但有整体超时控制
    const processingTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Quickship filters processing timeout after 20 seconds`));
      }, 20000); // 20 second timeout for all filters processing
    });

    const startTime = Date.now();
    const processedFilters = await Promise.race([
      Promise.all(facetFilters.map((filter) => processFilterGroup(filter, currentZipcode))),
      processingTimeout,
    ]);

    // 过滤掉空值并返回结果
    const result = processedFilters.filter((f) => f !== null);
    const duration = Date.now() - startTime;

    logger.info('Quickship filters processed successfully', {
      originalCount: facetFilters.length,
      processedCount: result.length,
      duration,
      context: 'quickship_processing',
    });
    return result;
  } catch (error) {
    // 最终回退：移除所有 quickship 标记
    logger.error('Quickship processing failed completely, applying fallback', {
      error: error instanceof Error ? error.message : String(error),
      originalFilterCount: facetFilters.length,
      context: 'quickship_processing',
    });
    return removeQuickshipMarkers(facetFilters);
  }
}

/**
 * Clean image object to only keep the 'large' field
 * This reduces payload size by removing unused image size variants
 */
function cleanImageData(imageObj: any): { large: string } | null {
  if (!imageObj || typeof imageObj !== 'object') return null;

  // 🛡️ 防御性检查：如果没有 large 字段，记录警告并返回 null
  if (!imageObj.large) {
    // 只在开发环境记录，避免生产环境日志过多
    if (EcEnv.NODE_ENV === 'development') {
      logger.warn('Image object missing large field during cleanup', {
        hasSmall: !!imageObj.small,
        hasMedium: !!imageObj.medium,
        keys: Object.keys(imageObj).slice(0, 5), // 只记录前5个键避免日志过大
        context: 'image_cleanup',
      });
    }
    return null;
  }

  return { large: imageObj.large };
}

/**
 * Clean variant images to remove unnecessary size variants
 * Only keeps the 'large' size which is used by ProductCard component
 */
function cleanVariantImages(variant: any): any {
  if (!variant || typeof variant !== 'object') return variant;

  const cleaned = { ...variant };

  // Clean life_style_image - only keep 'large' field
  if (variant.life_style_image) {
    const cleanedLifestyleImage = cleanImageData(variant.life_style_image);
    // 🛡️ 如果清理后为 null，保持为 undefined（而不是设置为 null）
    // 这样可以保持与原始数据结构的一致性
    if (cleanedLifestyleImage) {
      cleaned.life_style_image = cleanedLifestyleImage;
    } else {
      delete cleaned.life_style_image;
    }
  }

  // Clean images array - only keep 'large' field for each image
  if (Array.isArray(variant.images)) {
    const originalLength = variant.images.length;
    cleaned.images = variant.images
      .map(cleanImageData)
      .filter((img: { large: string } | null): img is { large: string } => img !== null);

    // 🛡️ 防御性检查：如果清理后图片数量减少，记录警告
    if (cleaned.images.length < originalLength && EcEnv.NODE_ENV === 'development') {
      logger.warn('Some images were filtered out during cleanup', {
        variantId: variant.id,
        originalCount: originalLength,
        cleanedCount: cleaned.images.length,
        context: 'image_cleanup',
      });
    }
  }

  return cleaned;
}

/**
 * Clean search response to remove unnecessary data
 * This significantly reduces the payload size of search API responses by:
 * 1. Removing unused image size variants (only keep 'large')
 * 2. Removing inner_hits (already processed on server side)
 *
 * 🔒 安全性保证：
 * - 只在 afterSearch hook 中调用，此时 inner_hits 已被 processSearchResponseWithVariantFiltering 使用完毕
 * - 使用浅拷贝策略，不会影响原始响应对象
 * - 包含防御性检查和开发环境日志
 */
function cleanSearchResponseImages(response: any): any {
  if (!response?.hits?.hits) return response;

  const cleanedResponse = { ...response };
  cleanedResponse.hits = { ...response.hits };

  let totalInnerHitsRemoved = 0;
  let totalImagesProcessed = 0;

  cleanedResponse.hits.hits = response.hits.hits.map((hit: any) => {
    const cleanedHit = { ...hit };

    // 🗑️ Remove inner_hits - already processed by processSearchResponseWithVariantFiltering
    // The filtered variants data has been extracted and applied to _source.variants
    // Keeping inner_hits only wastes bandwidth
    if (cleanedHit.inner_hits) {
      totalInnerHitsRemoved++;
      delete cleanedHit.inner_hits;
    }

    // Clean variants images if _source exists
    if (hit._source?.variants) {
      cleanedHit._source = { ...hit._source };

      // Clean variants images - only keep 'large' size
      if (Array.isArray(hit._source.variants)) {
        totalImagesProcessed += hit._source.variants.length;
        cleanedHit._source.variants = hit._source.variants.map(cleanVariantImages);
      }
    }

    return cleanedHit;
  });

  // 📊 记录清理统计（仅在开发环境或有异常时）
  if (EcEnv.NODE_ENV === 'development' || totalInnerHitsRemoved === 0) {
    logger.debug('Search response cleanup completed', {
      totalHits: response.hits.hits.length,
      innerHitsRemoved: totalInnerHitsRemoved,
      variantsProcessed: totalImagesProcessed,
      context: 'search_response_cleanup',
    });
  }

  return cleanedResponse;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const startTime = Date.now();

  // 📊 记录请求来源信息，用于追踪问题
  const referer = req.headers.get('referer') || 'unknown';

  // 🔗 优先使用 Sentry trace ID，fallback 到自定义 ID
  // Sentry trace ID 可以关联 Sentry 中的错误和性能追踪
  const sentryTraceId = Sentry?.getCurrentScope?.()?.getPropagationContext?.()?.traceId;
  const requestId = sentryTraceId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  /**
   * 代理到测试环境的接口
   * 如果涉及到这个接口的功能开发,记得在本地关闭这个代理
   *
   * SENTRY_E2E_ENABLED=1 仅由 scripts/e2e/sentry/run-server-capture.sh 在 E2E 运行时注入，
   * 生产环境不应设置此变量。
   */
  const isE2E = process.env.SENTRY_E2E_ENABLED === '1';

  if ((EcEnv.NODE_ENV === 'development' && enableProxy) || isE2E) {
    try {
      // 直接代理到测试环境接口
      const proxyUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/api/search`;

      // 获取原始请求体
      const requestData = await req.json();

      // 简化请求数据，移除可能有问题的参数
      const simplifiedRequestData = requestData.map((item: any) => ({
        ...item,
        params: {
          ...item.params,
          // ruleContexts: JSON.parse(item.params?.ruleContexts || '{}'),
        },
      }));

      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplifiedRequestData),
      });

      // 直接返回响应，不管成功还是失败
      const responseData = await proxyResponse.json();

      return NextResponse.json(responseData, { status: proxyResponse.status });
    } catch (error) {
      logger.error('Development proxy request failed', {
        error: error instanceof Error ? error.message : String(error),
        context: 'development_proxy',
      });
      return NextResponse.json(
        { error: '代理请求异常', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }

  const data = await req.json();

  if (!Array.isArray(data)) {
    logger.warn('Search API received non-array request body', {
      context: 'search_api_validation',
      dataType: typeof data,
      referer,
      requestId,
    });
    return createEmptyResponse();
  }

  // 🔧 SECURITY: Validate indexName to prevent invalid Elasticsearch queries
  // 使用统一配置验证，自动与 sorting 配置保持同步
  const requestIndexName = data?.[0]?.indexName;
  if (requestIndexName && !isValidIndexName(requestIndexName)) {
    logger.error('Invalid index name in search request', {
      indexName: requestIndexName,
      context: 'search_api_security',
      referer,
      requestId,
    });

    // Return empty results instead of querying invalid index
    return createEmptyResponse();
  }

  let ruleContexts = null;
  let queryString = '';
  let baseFilters = [];
  let categoryPermalink = '';
  let currentZipcode: string | null = null;
  let queryDeliverBeforeDeadline: string | null = null;
  let facetFilters = [];
  let ruleContextsString = '{}'; // Store the clean string version for later use
  try {
    // ruleContexts is always passed as [JSON.stringify(obj)] from client
    // See search-view-client.tsx line 72
    const ruleContextsArray = data?.[0]?.params?.ruleContexts;

    if (Array.isArray(ruleContextsArray) && ruleContextsArray.length > 0) {
      ruleContextsString = ruleContextsArray[0].trim();
      ruleContexts = JSON.parse(ruleContextsString);
    }
    queryString = ruleContexts?.queryString || '';
    baseFilters = ruleContexts?.baseFilters || [];
    categoryPermalink = ruleContexts?.categoryPermalink || '';
    currentZipcode = ruleContexts?.currentZipcode || null;
    // Get queryDeliverBeforeDeadline directly
    queryDeliverBeforeDeadline = ruleContexts?.queryDeliverBeforeDeadline || null;

    logger.info('Successfully parsed search context', {
      hasQueryString: !!queryString,
      baseFiltersCount: baseFilters.length,
      categoryPermalink: categoryPermalink || null,
      hasZipcode: !!currentZipcode,
      hasQueryDeliverBeforeDeadline: !!queryDeliverBeforeDeadline,
      context: 'search_request_parsing',
    });

    // Get facetFilters directly (no preprocessing needed)
    // __QUICKSHIP_ENABLED__ markers will be converted during ES query building
    facetFilters = data?.[0]?.params?.facetFilters || [];

    // 🔧 Early validation: If quickship marker exists but no zipcode, remove it immediately
    // This prevents Elasticsearch from trying to match the literal "__QUICKSHIP_ENABLED__" value
    const containsQuickshipMarker = facetFilters.some(hasQuickshipMarker);
    if (containsQuickshipMarker && !currentZipcode) {
      logger.warn('Quickship marker found in facetFilters but no zipcode available - removing marker', {
        facetFilterCount: facetFilters.length,
        hasZipcode: false,
        context: 'search_request_parsing',
      });
      facetFilters = removeQuickshipMarkers(facetFilters);
    }

    logger.debug('Facet filters received', {
      facetFilterCount: facetFilters.length,
      hasZipcode: !!currentZipcode,
      containsQuickshipMarker,
      context: 'search_request_parsing',
    });
  } catch (error) {
    logger.error('Failed to parse ruleContexts from request', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ruleContextsPreview: ruleContextsString ? ruleContextsString.substring(0, 500) : 'empty',
      ruleContextsLength: ruleContextsString?.length || 0,
      ruleContextsType: typeof ruleContextsString,
      context: 'search_request_parsing',
    });
    // Set fallback values
    ruleContextsString = '{}';
    ruleContexts = null;
  }

  /**
   * Parse query string to SearchKit-compatible filters
   * This function is moved from SearchViewServerWrapper to ensure unified processing
   * Returns both facetFilters and numericFilters
   */
  function parseQueryStringToFilters(queryString: string): { facetFilters: any[]; numericFilters: string[] } {
    if (!queryString || queryString.trim() === '') {
      return { facetFilters: [], numericFilters: [] };
    }
    queryString = queryString.trim();

    try {
      // Remove leading '?' if present
      const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
      const urlParams = new URLSearchParams(cleanQuery);

      // Categorize parameters by widget type for optimized processing
      const refinementLists: Record<string, string[]> = {};
      const ranges: Record<string, { min?: string; max?: string }> = {};
      const numericMenus: Record<string, string[]> = {};
      const toggles: Record<string, boolean> = {};

      for (const [key, value] of urlParams.entries()) {
        // Skip InstantSearch internal params
        if (key === 'q' || key === 'p' || key === 'sort') continue;

        // Parse key format and extract attribute name
        let attrName = key;

        // Handle array parameters (category[0], category[1], etc.)
        const arrayMatch = key.match(/^([^[]+)\[(\d+)\]$/);
        if (arrayMatch) {
          attrName = arrayMatch[1];
          const widgetType = FacetWidgetTypeUtils.getWidgetType(attrName);

          if (widgetType === FacetWidgetType.NUMERIC_MENU) {
            if (!numericMenus[attrName]) numericMenus[attrName] = [];
            numericMenus[attrName].push(value);
          } else {
            if (!refinementLists[attrName]) refinementLists[attrName] = [];
            refinementLists[attrName].push(value);
          }
          continue;
        }

        // Handle range parameters (price[min], price[max])
        const rangeMatch = key.match(/^([^[]+)\[(min|max)\]$/);
        if (rangeMatch) {
          attrName = rangeMatch[1];
          const rangeType = rangeMatch[2] as 'min' | 'max';
          if (!ranges[attrName]) ranges[attrName] = {};
          ranges[attrName][rangeType] = value;
          continue;
        }

        // Handle simple parameters
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          toggles[attrName] = value.toLowerCase() === 'true';
        } else {
          const widgetType = FacetWidgetTypeUtils.getWidgetType(attrName);

          if (widgetType === FacetWidgetType.NUMERIC_MENU) {
            if (!numericMenus[attrName]) numericMenus[attrName] = [];
            numericMenus[attrName].push(value);
          } else {
            refinementLists[attrName] = [value];
          }
        }
      }

      // Convert to facetFilters and numericFilters format
      const facetFilters: string[][] = [];
      const numericFilters: string[] = [];

      // Convert refinementLists (standard checkbox/list filters)
      for (const [attribute, values] of Object.entries(refinementLists)) {
        if (values && values.length > 0) {
          facetFilters.push(values.map((value) => `${attribute}:${value}`));
        }
      }

      // Convert numericMenus (special URL format handling)
      for (const [attribute, values] of Object.entries(numericMenus)) {
        if (values && values.length > 0) {
          // Convert from URL format back to range format for numericMenu
          // URL format: ["3_15", "57", "_100"]
          // Target: numericFilters format
          for (const urlValue of values) {
            if (urlValue.startsWith('_')) {
              // Only end value: "_100" -> "attribute<=100"
              const maxVal = urlValue.slice(1);
              const parsed = parseFloat(maxVal);
              if (!isNaN(parsed)) {
                numericFilters.push(`${attribute}<=${parsed}`);
              }
            } else if (urlValue.includes('_')) {
              // Both start and end: "3_15" -> "attribute>=3", "attribute<=15"
              const [minStr, maxStr] = urlValue.split('_');
              if (minStr) {
                const minParsed = parseFloat(minStr);
                if (!isNaN(minParsed)) {
                  numericFilters.push(`${attribute}>=${minParsed}`);
                }
              }
              if (maxStr) {
                const maxParsed = parseFloat(maxStr);
                if (!isNaN(maxParsed)) {
                  numericFilters.push(`${attribute}<=${maxParsed}`);
                }
              }
            } else {
              // Only start value: "57" -> "attribute>=57"
              const parsed = parseFloat(urlValue);
              if (!isNaN(parsed)) {
                numericFilters.push(`${attribute}>=${parsed}`);
              }
            }
          }
        }
      }

      // Convert ranges to numericFilters (not facetFilters)
      for (const [attribute, range] of Object.entries(ranges)) {
        if (range.min) {
          const parsed = parseFloat(range.min);
          if (!isNaN(parsed)) {
            numericFilters.push(`${attribute}>=${parsed}`);
          }
        }
        if (range.max) {
          const parsed = parseFloat(range.max);
          if (!isNaN(parsed)) {
            numericFilters.push(`${attribute}<=${parsed}`);
          }
        }
      }

      // Convert toggles
      for (const [attribute, value] of Object.entries(toggles)) {
        if (value === true) {
          // 🔧 Special handling for quickship: Convert to in_stock_regions refinement
          if (attribute === 'quickship') {
            facetFilters.push([`${FACET_ATTRIBUTE.in_stock_regions}:__QUICKSHIP_ENABLED__`]);
          } else {
            facetFilters.push([`${attribute}:true`]);
          }
        }
      }

      return { facetFilters, numericFilters };
    } catch (error) {
      logger.error('Failed to parse query string to filters', {
        error: error instanceof Error ? error.message : String(error),
        queryString: queryString.substring(0, 200), // Increased limit to see more context
        referer,
        requestId,
        context: 'filter_parsing',
      });
      return { facetFilters: [], numericFilters: [] };
    }
  }

  /**
   * Convert facetFilters to elasticsearchFilters using unified logic
   * Now both queryString and user facetFilters use the same conversion process
   *
   * Note: __QUICKSHIP_ENABLED__ markers are converted to actual inventory region codes here
   */
  async function convertFacetFiltersToElasticsearchFilters(
    facetFilters: any[],
    requestInfo: { referer: string; requestId: string },
    currentZipcode: string | null
  ): Promise<any[]> {
    const convertedFilters: any[] = [];

    // Group filters by attribute for processing
    const filtersByAttribute: Record<string, string[]> = {};
    const rangeFilters: Record<string, { min?: string; max?: string }> = {};

    // Process all facetFilters
    for (const filterGroup of facetFilters) {
      if (Array.isArray(filterGroup)) {
        for (const filter of filterGroup) {
          if (typeof filter === 'string' && filter.includes(':')) {
            // Handle range filters with special syntax
            if (filter.includes('[min]:') || filter.includes('[max]:')) {
              const minMatch = filter.match(/^([^[]+)\[min\]:(.+)$/);
              const maxMatch = filter.match(/^([^[]+)\[max\]:(.+)$/);

              if (minMatch) {
                const [, attribute, value] = minMatch;
                if (!rangeFilters[attribute]) rangeFilters[attribute] = {};
                rangeFilters[attribute].min = value;
              } else if (maxMatch) {
                const [, attribute, value] = maxMatch;
                if (!rangeFilters[attribute]) rangeFilters[attribute] = {};
                rangeFilters[attribute].max = value;
              }
            } else {
              // Handle regular term filters
              const [attribute, value] = filter.split(':', 2);
              if (!filtersByAttribute[attribute]) {
                filtersByAttribute[attribute] = [];
              }
              filtersByAttribute[attribute].push(value);
            }
          }
        }
      }
    }

    // Convert term filters
    for (const [attribute, values] of Object.entries(filtersByAttribute)) {
      if (values.length === 0) continue;

      // 🔧 Note: Quickship markers (__QUICKSHIP_ENABLED__) should have been converted to actual region codes
      // by processQuickshipFilters() before reaching this function. If we still see a marker here, log a warning.
      if (attribute === FACET_ATTRIBUTE.in_stock_regions && values.some((v) => v === '__QUICKSHIP_ENABLED__')) {
        logger.warn('Found unprocessed quickship marker in convertFacetFiltersToElasticsearchFilters', {
          attribute,
          values: values.slice(),
          referer: requestInfo.referer,
          requestId: requestInfo.requestId,
          context: 'filter_conversion',
        });
        // Skip this filter - it should have been processed earlier
        continue;
      }

      // Find the facet configuration for this attribute
      const facetConfig = (FACET_ATTRIBUTES_CONFIG as any[]).find((config) => config.attribute === attribute);

      if (!facetConfig) {
        logger.info('Missing facet configuration for attribute', {
          attribute,
          values,
          availableAttributes: FACET_ATTRIBUTES_CONFIG.map((c) => (c as any).attribute),
          referer: requestInfo.referer,
          requestId: requestInfo.requestId,
          context: 'filter_conversion',
        });
        continue;
      }

      const { field, nestedPath, type } = facetConfig;

      // Validate numeric fields - skip values that can't be parsed as numbers
      if (type === 'numeric') {
        const validValues = values.filter((value) => {
          const parsed = parseFloat(value);
          if (isNaN(parsed)) {
            logger.warn('Invalid numeric value in filter, skipping', {
              attribute,
              value,
              context: 'filter_validation',
            });
            return false;
          }
          return true;
        });

        if (validValues.length === 0) {
          logger.warn('No valid numeric values for attribute filter', {
            attribute,
            originalValueCount: values.length,
            context: 'filter_validation',
          });
          continue;
        }

        // Update values to use only valid numeric values
        values.length = 0;
        values.push(...validValues);
      }

      if (nestedPath) {
        // Create nested filter with SearchKit-compatible structure
        const nestedFilter = {
          bool: {
            should: [
              {
                nested: {
                  path: nestedPath,
                  query: {
                    bool: {
                      should: values.map((value) => ({
                        term: {
                          [`${nestedPath}.${field}`]: value,
                        },
                      })),
                    },
                  },
                },
              },
            ],
          },
        };

        convertedFilters.push(nestedFilter);
      } else {
        // Create simple terms filter for non-nested fields
        if (values.length === 1) {
          convertedFilters.push({
            term: {
              [field]: values[0],
            },
          });
        } else {
          convertedFilters.push({
            terms: {
              [field]: values,
            },
          });
        }
      }
    }

    // Convert range filters
    for (const [attribute, range] of Object.entries(rangeFilters)) {
      if (!range.min && !range.max) continue;

      const facetConfig = (FACET_ATTRIBUTES_CONFIG as any[]).find((config) => config.attribute === attribute);

      if (!facetConfig) {
        logger.warn('Missing facet configuration for range attribute', {
          attribute,
          context: 'filter_conversion',
        });
        continue;
      }

      const { field, nestedPath } = facetConfig;

      const rangeQuery: any = {};
      if (range.min) {
        const parsed = parseFloat(range.min);
        if (!isNaN(parsed)) rangeQuery.gte = parsed;
      }
      if (range.max) {
        const parsed = parseFloat(range.max);
        if (!isNaN(parsed)) rangeQuery.lte = parsed;
      }

      if (Object.keys(rangeQuery).length > 0) {
        if (nestedPath) {
          convertedFilters.push({
            bool: {
              should: [
                {
                  nested: {
                    path: nestedPath,
                    query: {
                      bool: {
                        should: [
                          {
                            range: {
                              [`${nestedPath}.${field}`]: rangeQuery,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          });
        } else {
          convertedFilters.push({
            range: {
              [field]: rangeQuery,
            },
          });
        }
      }
    }

    return convertedFilters;
  }

  /**
   * Generate category-based base filters if categoryPermalink is provided
   */
  function generateCategoryBaseFilters(categoryPermalink: string): any[] {
    if (!categoryPermalink) return [];

    return [
      {
        bool: {
          must: {
            nested: {
              path: 'categories',
              query: {
                term: {
                  'categories.permalink': categoryPermalink,
                },
              },
            },
          },
        },
      },
    ];
  }

  /**
   * Smart field conflict resolution for category filters
   * When user selects a different category, it should replace (not AND) the queryString category
   */
  function resolveCategoryConflicts(
    queryStringFilters: any[],
    userFacetFilters: any[]
  ): { queryFilters: any[]; userFilters: any[] } {
    // Extract category filters from both sources
    const queryCategories = queryStringFilters.filter(
      (group) =>
        Array.isArray(group) && group.some((filter) => typeof filter === 'string' && filter.startsWith('category:'))
    );

    const userCategories = userFacetFilters.filter(
      (group) =>
        Array.isArray(group) && group.some((filter) => typeof filter === 'string' && filter.startsWith('category:'))
    );

    if (queryCategories.length > 0 && userCategories.length > 0) {
      logger.info('Category filter conflict resolved - user selection takes priority', {
        queryCategories: queryCategories.length,
        userCategories: userCategories.length,
        context: 'filter_conflict_resolution',
      });
      // Remove category filters from queryString, keep user selection
      const filteredQueryFilters = queryStringFilters.filter(
        (group) =>
          !Array.isArray(group) || !group.some((filter) => typeof filter === 'string' && filter.startsWith('category:'))
      );
      return { queryFilters: filteredQueryFilters, userFilters: userFacetFilters };
    }

    return { queryFilters: queryStringFilters, userFilters: userFacetFilters };
  }

  try {
    // Parse queryString to facetFilters and numericFilters format for unified processing
    const queryStringResult = queryString
      ? parseQueryStringToFilters(queryString)
      : { facetFilters: [], numericFilters: [] };
    const queryStringFilters = queryStringResult.facetFilters;
    const queryStringNumericFilters = queryStringResult.numericFilters;

    // Convert queryDeliverBefore deadline to lead_time numericFilters
    const deliverBeforeNumericFilters = convertDeadlineToLeadTimeFilter(queryDeliverBeforeDeadline);

    // Combine all numeric filters
    const allNumericFilters = [...queryStringNumericFilters, ...deliverBeforeNumericFilters];

    // Generate category-based base filters if needed
    const categoryBasedFilters = categoryPermalink ? generateCategoryBaseFilters(categoryPermalink) : [];

    // Combine all base filters
    const allBaseFilters = [...baseFilters, ...categoryBasedFilters];

    logger.info('Starting unified filter processing', {
      queryStringFiltersCount: queryStringFilters.length,
      userFacetFiltersCount: facetFilters.length,
      baseFiltersCount: baseFilters.length,
      hasQueryDeliverBeforeDeadline: !!queryDeliverBeforeDeadline,
      deliverBeforeNumericFiltersCount: deliverBeforeNumericFilters.length,
      hasCategoryPermalink: !!categoryPermalink,
      referer,
      requestId,
      context: 'search_filter_processing',
    });

    // Apply smart conflict resolution for category filters
    const { queryFilters: resolvedQueryFilters, userFilters: resolvedUserFilters } = resolveCategoryConflicts(
      queryStringFilters,
      facetFilters
    );

    // Combine all facetFilters for unified processing after conflict resolution
    const allFacetFilters = [...resolvedQueryFilters, ...resolvedUserFilters];

    // 🔧 Step 1: Process quickship filters first (convert __QUICKSHIP_ENABLED__ to actual region codes)
    // This step handles all error cases and timeouts gracefully
    let processedFacetFilters: any[] = [];
    try {
      processedFacetFilters = await processQuickshipFilters(allFacetFilters, currentZipcode);
    } catch (quickshipError) {
      logger.error('Quickship processing failed, using fallback (filters without quickship)', {
        error: quickshipError instanceof Error ? quickshipError.message : String(quickshipError),
        facetFilterCount: allFacetFilters.length,
        referer,
        requestId,
        context: 'search_filter_processing',
      });
      // Fallback: Remove all quickship markers and continue with other filters
      processedFacetFilters = removeQuickshipMarkers(allFacetFilters);
    }

    // 🔧 Step 2: Convert processed facetFilters to elasticsearchFilters
    // At this point, all quickship markers have been converted to actual values like "in_stock_regions:us-west"
    let convertedFilters: any[] = [];
    try {
      convertedFilters = await convertFacetFiltersToElasticsearchFilters(
        processedFacetFilters,
        { referer, requestId },
        currentZipcode
      );
    } catch (filterError) {
      logger.error('Filter conversion failed, using fallback', {
        error: filterError instanceof Error ? filterError.message : String(filterError),
        facetFilterCount: processedFacetFilters.length,
        referer,
        requestId,
        context: 'search_filter_processing',
      });
      convertedFilters = [];
    }

    const mergedElasticsearchFilters =
      allBaseFilters.length > 0 ? [...allBaseFilters, ...convertedFilters] : convertedFilters;

    // Clear facetFilters since we're handling everything through elasticsearchFilters
    const finalFacetFilters: any[] = [];

    // 更新请求数据中的 facetFilters 和通过 ruleContexts 传递合并后的过滤器
    const updatedData = await Promise.all(
      data.map(async (item: any, index: number) => {
        if (item.params) {
          // 🔧 CRITICAL FIX: Remove quickship markers from facetFilters
          // All filters (including quickship) have been converted to elasticsearchFilters
          // If we pass the original facetFilters with __QUICKSHIP_ENABLED__, it will cause 0 results
          let cleanedFacetFilters = item.params.facetFilters || finalFacetFilters;
          if (Array.isArray(cleanedFacetFilters) && cleanedFacetFilters.some(hasQuickshipMarker)) {
            cleanedFacetFilters = removeQuickshipMarkers(cleanedFacetFilters);
            logger.info('Removed quickship markers from request facetFilters', {
              originalCount: item.params.facetFilters?.length || 0,
              cleanedCount: cleanedFacetFilters.length,
              context: 'search_filter_processing',
            });
          }
          const processedFacetFilters = cleanedFacetFilters;

          if (index === 0) {
            // 更新 ruleContexts 中的 elasticsearchFilters
            // Format is always [JSON.stringify(obj)] from client
            let updatedRuleContexts = item.params.ruleContexts;

            // Only update if we have valid parsed ruleContexts and filters to add
            if (ruleContexts && mergedElasticsearchFilters.length > 0) {
              try {
                const updatedObj = { ...ruleContexts, elasticsearchFilters: mergedElasticsearchFilters };
                updatedRuleContexts = [JSON.stringify(updatedObj)];
              } catch (error) {
                logger.error('Failed to update ruleContexts with elasticsearch filters', {
                  error: error instanceof Error ? error.message : String(error),
                  context: 'search_filter_processing',
                });
                // On error, keep original ruleContexts unchanged
              }
            }

            return {
              ...item,
              params: {
                ...item.params,
                facetFilters: processedFacetFilters,
                numericFilters: allNumericFilters.length > 0 ? allNumericFilters : item.params.numericFilters,
                ruleContexts: updatedRuleContexts,
              },
            };
          } else {
            return {
              ...item,
              params: {
                ...item.params,
                facetFilters: processedFacetFilters,
                numericFilters: allNumericFilters.length > 0 ? allNumericFilters : item.params.numericFilters,
              },
            };
          }
        }
        return item;
      })
    );

    const response = await apiClient.handleRequest(updatedData, {
      getBaseFilters: () => {
        const baseFilters = [
          ...mergedElasticsearchFilters,
          {
            nested: {
              path: 'variants',
              query: {
                bool: {
                  filter: {
                    exists: {
                      field: 'variants',
                    },
                  },
                },
              },
            },
          },
        ];
        return baseFilters;
      },
      hooks: {
        async beforeSearch(requests) {
          addNestedFilterInnerHitsNames(requests);
          return requests;
        },
        async afterSearch(requests, responses) {
          // Assuming responses is an array of SearchResponse objects
          let typedResponses = responses;
          typedResponses = processSearchResponseWithVariantFiltering(typedResponses, requests);
          // Then apply DY ranking
          const filteredResponses = await Promise.all(
            typedResponses.map(async (response, index) => {
              // Only apply DY ranking to the first (main) search request/response
              if (index === 0 && response.hits && response.hits.hits && response.hits.hits.length > 0) {
                const searchRequest = requests[index];
                const isDyRanking = shouldApplyDyRanking(searchRequest);
                logger.debug('DY ranking evaluation for search response', {
                  isDyRanking,
                  responseIndex: index,
                  hitsCount: response.hits.hits.length,
                  hasDyRankingContext: !!(ruleContexts && ruleContexts.dyRanking),
                  context: 'search_response_processing',
                });
                if (isDyRanking && ruleContexts && ruleContexts.dyRanking) {
                  const reorderedHits = (await applyDyRanking(response.hits.hits, ruleContexts.dyRanking)) as Array<
                    SearchHit<SpuSource>
                  >;
                  response.hits.hits = reorderedHits;
                }
              }
              return response;
            })
          );
          // 🔧 ENABLED: Clean up unnecessary image sizes from response
          const cleanedResponses = filteredResponses.map(cleanSearchResponseImages);
          return cleanedResponses;
        },
      },
      getQuery(query) {
        return {
          bool: {
            must: [
              {
                bool: {
                  filter: {
                    nested: {
                      path: 'variants',
                      query: {
                        bool: {
                          filter: {
                            exists: {
                              field: 'variants',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              {
                bool: {
                  should: [
                    // Boost products whose name contains specific phrases above category matches
                    ...BOOSTED_NAME_PHRASES.filter((phrase) => query.toLowerCase().includes(phrase)).map((phrase) => ({
                      match_phrase: {
                        name: {
                          query: phrase,
                          boost: 1500,
                        },
                      },
                    })),
                    {
                      match: {
                        name: {
                          query: query,
                          fuzziness: 1,
                          prefix_length: 1,
                        },
                      },
                    },
                    {
                      match: {
                        'name.stemmed': {
                          query: query,
                        },
                      },
                    },
                    {
                      match: {
                        name: {
                          query: query,
                        },
                      },
                    },
                    {
                      nested: {
                        path: 'taxons',
                        query: {
                          match: {
                            'taxons.name': {
                              query: query,
                              fuzziness: 1,
                              prefix_length: 1,
                            },
                          },
                        },
                      },
                    },
                    {
                      nested: {
                        path: 'taxons',
                        query: {
                          match: {
                            'taxons.stemmed': {
                              query: query,
                            },
                          },
                        },
                      },
                    },
                    {
                      nested: {
                        path: 'taxons',
                        query: {
                          match: {
                            'taxons.name': {
                              query: query,
                            },
                          },
                        },
                      },
                    },
                    {
                      nested: {
                        path: 'categories',
                        query: {
                          wildcard: {
                            'categories.permalink': {
                              value: `*${query}*`,
                              boost: 1000,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        };
      },
    });

    const duration = Date.now() - startTime;
    logger.info('Search request completed successfully', {
      duration,
      hasResponse: !!response,
      referer,
      requestId,
      context: 'search_api_success',
    });

    // Validate response structure before returning
    if (!response || !response.results) {
      const errorDetails = {
        hasResponse: !!response,
        hasResults: !!(response && response.results),
        responseType: response ? typeof response : 'null',
        responseKeys: response ? Object.keys(response).join(', ') : 'none',
        resultsType: response?.results ? typeof response.results : 'undefined',
        duration,
        referer,
        requestId,
        context: 'search_api_validation',
        // Request context for debugging
        requestSummary: {
          requestCount: data?.length || 0,
          hasRuleContexts: !!ruleContexts,
          hasQueryString: !!queryString,
          hasCategoryPermalink: !!categoryPermalink,
          facetFiltersCount: facetFilters?.length || 0,
        },
      };

      logger.error('Search API returned invalid response structure', errorDetails);

      // Also capture in Sentry for monitoring
      Sentry.captureException(new Error('Invalid search API response structure'), {
        tags: {
          component: 'search_api',
          issue: 'invalid_response_structure',
        },
        extra: errorDetails,
      });

      return createEmptyResponse();
    }

    return NextResponse.json(response);
  } catch (error: any) {
    const duration = Date.now() - startTime;

    const errorDetails = {
      message: error?.message || 'Unknown error',
      statusCode: error?.statusCode || error?.response?.status,
      elasticsearchError: error?.body?.error?.type || 'unknown',
      elasticsearchReason: error?.body?.error?.reason,
      errorName: error?.name,
      errorType: error?.constructor?.name,
      hasOriginalData: !!data,
      duration,
      referer,
      requestId,
      context: 'search_api_error',
      // Stack trace (first 500 chars to avoid too much data)
      stack: error?.stack ? error.stack.substring(0, 500) : undefined,
      // Request context for debugging
      requestSummary: {
        requestCount: data?.length || 0,
        hasRuleContexts: !!ruleContexts,
        hasQueryString: !!queryString,
        hasCategoryPermalink: !!categoryPermalink,
        currentZipcode: currentZipcode ? currentZipcode : 'missing',
        facetFiltersCount: facetFilters?.length || 0,
      },
    };

    logger.error('Search API request failed', errorDetails);

    // Capture in Sentry with appropriate context
    Sentry.captureException(error, {
      tags: {
        component: 'search_api',
        issue: 'api_request_failed',
        error_type: error?.constructor?.name || 'Unknown',
      },
      extra: errorDetails,
      contexts: {
        request: {
          referer,
          request_id: requestId,
          duration_ms: duration,
        },
      },
    });

    return createEmptyResponse();
  }
}

// Extracted repetitive code into a helper function
// Returns 500 status to indicate error for proper logging and monitoring
// But still provides valid response structure for client to handle gracefully
function createEmptyResponse() {
  return NextResponse.json(
    {
      results: [
        {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          query: '',
          facets: {},
        },
      ],
    },
    { status: 500 }
  );
}
