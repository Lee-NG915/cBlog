'use client';
import { EcEnv } from '@castlery/config';
import { Box, Container, useBreakpoints } from '@castlery/fortress';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Configure } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import type { ElasticsearchQuery } from 'searchkit';
import type { DyRankingContext } from '../api/search/dy-ranking.utils';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentZipcode } from '@castlery/modules-user-domain';
import { getSortOptions, type SortOption } from '../config/sort-options.config';
import { CustomSearchBox } from '../instantsearch/custom-search-box';
import { FacetsContent } from '../instantsearch/facets-content';
import { CustomHits, CustomInfiniteHits } from '../instantsearch/hits';
import { NoResults } from '../instantsearch/no-results';
import { NoResultsBoundary } from '../instantsearch/no-results-boundary';
import { HasResultsBoundary } from '../instantsearch/has-results-boundary';
import { CustomPagination } from '../instantsearch/pagination';
import { QuickshipToggleRefinementWrapper } from '../instantsearch/quickship-toggle-refinement';
import { ScrollTo } from '../instantsearch/scroll-to';
import { singleIndexStateMapping } from '../instantsearch/utils';
import { SearchLoading } from '../instantsearch/search-loading';
import { DesktopFilterControls } from './desktop-filter-controls';
import { MobileFilter } from './mobile-fitler';
import { TrackingMiddleware } from '../tracking/tracking-middleware';
import { SearchResultsLoadedTracking } from '../tracking/search-results-loaded-tracking';
import { SearchProvider } from '../config/search-context';
import type { FilterOrdersData } from '../config/search-context';
import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';
import { logger, captureStructuredError, BusinessSeverity, BUSINESS_DOMAIN } from '@castlery/observability/client';

// Define the rule contexts type to include both DY ranking and filters
type SearchRuleContexts = {
  dyRanking?: DyRankingContext;
  elasticsearchFilters?: ElasticsearchQuery[];
  queryString?: string;
  baseFilters?: ElasticsearchQuery[];
  categoryPermalink?: string;
  currentZipcode?: string | null;
};

// import { SearchErrorToast } from '../instantsearch/search-error-toast';

const IndexNames = ['web_product', 'pos_product'] as const;

// Create Searchkit instance
const getSearchUrl = () => {
  // if (EcEnv.NODE_ENV === 'development') {
  //   /**
  //    * 这里是专门为本地开发环境准备的, 这里的消费的接口是已经部署到测试环境的接口
  //    * 如果涉及到 libs/modules/search/components/src/lib/api/search/route.ts 的改动, 就需要关闭这个选项,不然修改的代码不会生效
  //    */
  //   return `https://www-test.castlery.com/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/api/search`;
  // }
  if (EcEnv.NEXT_PUBLIC_IS_SERVER) {
    return `${EcEnv.APP_API_BASE_URL}/search`;
  }
  // 客户端使用相对路径
  return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/api/search`;
};

const url = getSearchUrl();

// Request Deduplication & Result Caching - Client-side only
// Two-level caching:
// 1. In-flight requests - avoid duplicate network calls while request is pending
// 2. Completed results - cache successful responses for faster repeated searches

interface PendingRequest {
  promise: Promise<any>;
  abortController: AbortController;
  timestamp: number;
}

interface CachedResult {
  data: any;
  timestamp: number;
  hits: number; // For monitoring
}

// Client-side only caches (not shared in SSR)
let clientPendingRequests: Map<string, PendingRequest> | null = null;
let clientResultCache: Map<string, CachedResult> | null = null;
let clientLatestRequestKey: string | null = null;

// Track the initial SSR request key to allow reuse during hydration
let initialSSRRequestKey: string | null = null;

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Result cache TTL in milliseconds (5 minutes)
// After this time, cached results are considered stale and will be re-fetched
const RESULT_CACHE_TTL = 5 * 60 * 1000;

// Maximum cache sizes to prevent memory issues
const MAX_PENDING_REQUESTS = 10;
const MAX_RESULT_CACHE_SIZE = 50;

// Marketing parameter configuration for URL routing
// These parameters will be preserved across search state changes

// PREFIXES: Parameters that have multiple variants (e.g., utm_source, utm_medium)
const MARKETING_PARAM_PREFIXES = [
  'utm_', // Google Analytics UTM parameters (utm_source, utm_medium, utm_campaign, etc.)
  'gad_', // Google Ads parameters (gad_source, gad_campaignid, gad_adgroupid, etc.)
  'li_', // LinkedIn parameters (li_fat_id, li_mc, etc.)
];

// NAMES: Single, fixed parameter names
const MARKETING_PARAM_NAMES = [
  // Generic tracking
  'link', // Generic link parameter
  'ref', // Referrer parameter
  'source', // Source parameter
  'campaign', // Generic campaign parameter
  // Google ecosystem
  'gclid', // Google Click ID
  'gbraid', // Google GBRAID (iOS privacy tracking)
  'wbraid', // Google WBRAID (web to app)
  // Facebook
  'fbclid', // Facebook Click ID
  'brid', // Facebook Browser ID (cross-device tracking)
  // Microsoft
  'msclkid', // Microsoft Click ID
  // TikTok
  'ttclid', // TikTok Click ID
  // Twitter/X
  'twclid', // Twitter Click ID
  // Affiliate marketing
  'irgwc', // Impact Radius Global Webmaster Campaign
  'irclickid', // Impact Radius Click ID
  'afftrack', // Generic affiliate tracking
  'ccid', // Campaign Click ID
  'dyApiPreview', // Dy api preview
];

// 🔧 错误熔断器：防止无限重试
// 当连续错误达到阈值时，停止发送新请求，避免无限循环
// 按 indexName 隔离，避免不同排序方式互相影响
const ERROR_THRESHOLD = 3; // 连续错误3次后熔断
const ERROR_RESET_TIMEOUT = 10000; // 10秒后重置错误计数
// Progressive cooldown before circuit fully opens: InstantSearch reacts to
// empty results by updating widget state, which can re-trigger search()
// within milliseconds.  A short per-error cooldown breaks the rapid loop.
const ERROR_COOLDOWN_BASE = 2000; // 2s after 1st error, 4s after 2nd, …

// Map of indexName -> { consecutiveErrors, lastErrorTime, isOpen }
const circuitBreakers = new Map<string, { consecutiveErrors: number; lastErrorTime: number; isOpen: boolean }>();

function getCircuitBreaker(indexName: string) {
  if (!circuitBreakers.has(indexName)) {
    circuitBreakers.set(indexName, { consecutiveErrors: 0, lastErrorTime: 0, isOpen: false });
  }
  return circuitBreakers.get(indexName)!;
}

/**
 * Get client-side pending requests cache
 * Returns null on server to prevent SSR state sharing
 */
function getPendingRequestsCache() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!clientPendingRequests) {
    clientPendingRequests = new Map();
  }
  return clientPendingRequests;
}

/**
 * Get client-side result cache
 * Returns null on server to prevent SSR state sharing
 */
function getResultCache() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!clientResultCache) {
    clientResultCache = new Map();
  }
  return clientResultCache;
}

/**
 * Clean expired entries from result cache
 */
function cleanExpiredResultCache() {
  const cache = getResultCache();
  if (!cache) return;

  const now = Date.now();
  let cleaned = 0;

  for (const [key, cached] of cache.entries()) {
    if (now - cached.timestamp > RESULT_CACHE_TTL) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug('Cleaned expired search result cache entries', {
      context: 'search_result_cache_cleanup',
      cleaned,
      remaining: cache.size,
    });
  }
}

/**
 * Enforce maximum cache size using LRU (Least Recently Used) strategy
 */
function enforceResultCacheSize() {
  const cache = getResultCache();
  if (!cache) return;

  if (cache.size > MAX_RESULT_CACHE_SIZE) {
    const entriesToDelete = cache.size - MAX_RESULT_CACHE_SIZE;
    let count = 0;

    // Delete oldest entries (Map maintains insertion order)
    for (const key of cache.keys()) {
      if (count++ >= entriesToDelete) break;
      cache.delete(key);
    }

    logger.debug('Search result cache size limit enforced', {
      context: 'search_result_cache_size',
      deleted: entriesToDelete,
      remaining: cache.size,
    });
  }
}

/**
 * Clear all cached search results
 * Useful when user logs out, changes country, or other significant state changes
 */
export function clearSearchResultCache() {
  const cache = getResultCache();
  if (!cache) return;

  const size = cache.size;
  cache.clear();

  if (size > 0) {
    logger.info('Search result cache cleared', {
      context: 'search_result_cache_clear',
      entriesCleared: size,
    });
  }
}

/**
 * 重置搜索错误熔断器
 * 用于手动恢复熔断状态（例如在开发调试或用户刷新页面时）
 */
export function resetSearchCircuitBreaker(indexName?: string) {
  if (typeof window === 'undefined') {
    return; // Only works on client-side
  }

  if (indexName) {
    const breaker = getCircuitBreaker(indexName);
    const wasOpen = breaker.isOpen;
    breaker.consecutiveErrors = 0;
    breaker.lastErrorTime = 0;
    breaker.isOpen = false;

    logger.info('Search circuit breaker reset manually', {
      context: 'search_circuit_breaker',
      indexName,
      wasOpen,
    });
  } else {
    const count = circuitBreakers.size;
    circuitBreakers.clear();

    logger.info('All search circuit breakers reset manually', {
      context: 'search_circuit_breaker',
      count,
    });
  }
}

/**
 * Generate unique request identifier
 * Serializes key request parameters to identify duplicate requests
 */
function getRequestKey(requests: any[]): string {
  try {
    const normalizedRequests = requests.map((req) => ({
      indexName: req.indexName,
      params: {
        query: req.params?.query,
        facetFilters: req.params?.facetFilters,
        numericFilters: req.params?.numericFilters,
        page: req.params?.page,
        hitsPerPage: req.params?.hitsPerPage,
        ruleContexts: req.params?.ruleContexts,
      },
    }));
    const key = JSON.stringify(normalizedRequests);

    logger.debug('Request key generated', {
      context: 'search_request_key',
      keyPreview: key.substring(0, 200),
      facetFilters: normalizedRequests[0]?.params?.facetFilters,
    });

    return key;
  } catch (error) {
    // If serialization fails, return unique key (no deduplication)
    logger.warn('Failed to generate request key, using fallback', {
      context: 'search_request_key_fallback',
      error: error instanceof Error ? error.message : String(error),
    });
    return `fallback_${Date.now()}_${Math.random()}`;
  }
}

/**
 * Send search request with custom fetch configuration
 * - Omits credentials for better caching
 * - Supports request cancellation via AbortSignal
 * - Handles various HTTP error scenarios
 */
async function customFetch(requests: any[], signal: AbortSignal): Promise<any> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requests),
      credentials: 'omit',
      signal,
    });
  } catch (error) {
    // Network-level errors (no response received)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // Request was cancelled (timeout or user action)
        throw error;
      }
      // Network failure (offline, DNS error, etc.)
      const networkError = new Error(`Network error: ${error.message}`);
      networkError.name = 'NetworkError';
      throw networkError;
    }
    throw error;
  }

  // HTTP error responses (response received but not ok)
  if (!response.ok) {
    const errorMessage = `Search API returned ${response.status}: ${response.statusText}`;

    let errorDetails = null;
    let responsePreview = '';
    try {
      const text = await response.text();
      responsePreview = text.substring(0, 500);
      errorDetails = JSON.parse(text);
    } catch {
      // Response body is not JSON — responsePreview still holds the raw text
    }

    const apiError = new Error(errorMessage);
    apiError.name = 'APIError';
    (apiError as any).status = response.status;
    (apiError as any).details = errorDetails;
    (apiError as any).responsePreview = responsePreview;

    logger.error('Search API returned error response', {
      context: 'search_api_error',
      status: response.status,
      statusText: response.statusText,
      errorDetails,
      responsePreview,
    });

    throw apiError;
  }

  // Parse JSON response — clone so we can read body as text if JSON parsing fails
  const responseClone = response.clone();
  try {
    return await response.json();
  } catch (error) {
    const contentType = response.headers.get('content-type') || 'unknown';
    const status = response.status;

    let responsePreview = 'Unable to read response';
    try {
      const text = await responseClone.text();
      responsePreview = text.substring(0, 500);
    } catch {
      // Should not happen — clone was created before any body consumption
    }

    const parseError = new Error('Failed to parse Search API response as JSON');
    parseError.name = 'ParseError';
    (parseError as any).status = status;
    (parseError as any).contentType = contentType;
    (parseError as any).responsePreview = responsePreview;

    logger.error('Failed to parse Search API response', {
      context: 'search_response_parse',
      error: error instanceof Error ? error.message : String(error),
      status,
      contentType,
      responsePreview,
    });

    throw parseError;
  }
}

// Wrapper to ensure response always has proper structure
const searchClient = {
  async search(requests: any[]) {
    const isServer = typeof window === 'undefined';
    const indexName = requests?.[0]?.indexName || 'web_product';

    // 🔧 UI层错误熔断器 + 渐进式冷却
    // 按 indexName 隔离，不同排序方式独立跟踪
    //
    // 两层保护：
    //   1. 渐进冷却：每次错误后强制等待 (2s, 4s, ...)，防止 InstantSearch
    //      状态变化导致毫秒级连续重试
    //   2. 完全熔断：连续 ERROR_THRESHOLD 次错误后，ERROR_RESET_TIMEOUT 内拒绝所有请求
    if (!isServer) {
      const breaker = getCircuitBreaker(indexName);

      if (breaker.isOpen) {
        const timeSinceLastError = Date.now() - breaker.lastErrorTime;

        if (timeSinceLastError > ERROR_RESET_TIMEOUT) {
          logger.info('Circuit breaker attempting recovery', {
            context: 'search_circuit_breaker',
            indexName,
            timeSinceLastError,
            consecutiveErrors: breaker.consecutiveErrors,
          });
          breaker.isOpen = false;
          breaker.consecutiveErrors = 0;
        } else {
          logger.warn('Circuit breaker is open, blocking search request', {
            context: 'search_circuit_breaker',
            indexName,
            consecutiveErrors: breaker.consecutiveErrors,
            timeSinceLastError,
          });
          return createEmptySearchResponse(requests);
        }
      } else if (breaker.consecutiveErrors > 0) {
        const timeSinceLastError = Date.now() - breaker.lastErrorTime;
        const cooldown = ERROR_COOLDOWN_BASE * breaker.consecutiveErrors;

        if (timeSinceLastError < cooldown) {
          logger.debug('Search request blocked by progressive cooldown', {
            context: 'search_circuit_breaker',
            indexName,
            consecutiveErrors: breaker.consecutiveErrors,
            timeSinceLastError,
            cooldown,
          });
          return createEmptySearchResponse(requests);
        }
      }
    }

    // SSR Optimization - Use cached initialResults on first client-side request
    // This prevents duplicate search requests during hydration
    if (!isServer) {
      const InstantSearchInitialResults = Symbol.for('InstantSearchInitialResults');
      const initialResults = (window as any)[InstantSearchInitialResults];

      if (initialResults) {
        const indexName = requests?.[0]?.indexName || 'web_product';

        if (initialResults[indexName]) {
          const currentRequestKey = getRequestKey(requests);

          // 🔧 FIX: 立即清除 SSR 缓存，防止后续请求误用
          // First time seeing SSR cache - check if we should use it
          if (!initialSSRRequestKey) {
            initialSSRRequestKey = currentRequestKey;
            logger.debug('SSR initial results detected', {
              context: 'search_client_ssr_cache',
              requestKey: currentRequestKey.substring(0, 100),
            });

            // 立即清除 window 上的缓存，防止后续请求看到它
            delete (window as any)[InstantSearchInitialResults];
          }

          // Only return cached SSR results if request matches initial request
          if (currentRequestKey === initialSSRRequestKey) {
            logger.debug('Using SSR cached results', {
              context: 'search_client_ssr_cache_hit',
            });
            return {
              results: [initialResults[indexName].results[0]],
            };
          } else {
            // Different request - user changed search/filters
            // SSR cache was already cleared above, just reset tracking
            logger.debug('SSR cache cleared - request parameters changed', {
              context: 'search_client_ssr_cache_clear',
              oldKey: initialSSRRequestKey?.substring(0, 100),
              newKey: currentRequestKey.substring(0, 100),
            });
            initialSSRRequestKey = null;
          }
        }
      }
    }

    // Server-side: Direct fetch without deduplication
    // Deduplication only runs on client-side to avoid SSR state sharing issues
    if (isServer) {
      try {
        return await executeSearchRequest(requests, new AbortController().signal);
      } catch (error) {
        logger.error('Server-side search request failed', {
          error: error instanceof Error ? error.message : String(error),
          context: 'search_client_ssr',
          requestCount: requests?.length || 0,
        });

        captureStructuredError(error as Error, {
          domain: BUSINESS_DOMAIN.SEARCH,
          severity: BusinessSeverity.HIGH,
          tags: {
            component: 'search_client',
            issue: 'ssr_request_failed',
            environment: 'server',
          },
          extra: {
            requestCount: requests?.length || 0,
          },
        });

        // Return empty response to prevent SSR crash
        return createEmptySearchResponse(requests);
      }
    }

    // Client-side: Two-level caching strategy
    const pendingCache = getPendingRequestsCache();
    const resultCache = getResultCache();

    if (!pendingCache || !resultCache) {
      // Fallback: if cache initialization fails, execute directly
      return await executeSearchRequest(requests, new AbortController().signal);
    }

    const requestKey = getRequestKey(requests);

    // Level 1: Check result cache (completed requests)
    if (resultCache.has(requestKey)) {
      const cached = resultCache.get(requestKey)!;
      const age = Date.now() - cached.timestamp;

      if (age < RESULT_CACHE_TTL) {
        logger.debug('Search result cache hit', {
          context: 'search_result_cache_hit',
          age,
          ttl: RESULT_CACHE_TTL,
          hits: cached.hits,
          cacheSize: resultCache.size,
          // 🔧 添加请求参数用于调试
          requestParams: requests?.[0]?.params?.facetFilters || [],
        });
        return cached.data;
      } else {
        // Expired, remove from cache
        resultCache.delete(requestKey);
        logger.debug('Search result cache expired', {
          context: 'search_result_cache_expired',
          age,
          ttl: RESULT_CACHE_TTL,
        });
      }
    }

    // Level 2: Check in-flight request cache
    if (pendingCache.has(requestKey)) {
      logger.debug('Duplicate search request detected, reusing in-flight request', {
        context: 'search_client_deduplication',
        pendingCount: pendingCache.size,
      });
      return pendingCache.get(requestKey)!.promise;
    }

    // Cancel old requests if this is a different request (race condition prevention)
    if (clientLatestRequestKey && clientLatestRequestKey !== requestKey) {
      logger.debug('New search request detected, cancelling previous requests', {
        context: 'search_client_race_prevention',
      });

      pendingCache.forEach((pending, key) => {
        if (key !== requestKey) {
          pending.abortController.abort();
        }
      });
      pendingCache.clear();
    }

    clientLatestRequestKey = requestKey;

    // Prevent pending cache from growing too large
    if (pendingCache.size >= MAX_PENDING_REQUESTS) {
      logger.warn('Pending requests cache size limit reached, clearing old entries', {
        context: 'search_client_cache_overflow',
        size: pendingCache.size,
      });
      const entriesToDelete = pendingCache.size - MAX_PENDING_REQUESTS + 1;
      let count = 0;
      for (const key of pendingCache.keys()) {
        if (count++ >= entriesToDelete) break;
        pendingCache.delete(key);
      }
    }

    const abortController = new AbortController();

    // Create request promise with timeout
    const requestPromise = (async () => {
      const timeoutId = setTimeout(() => {
        abortController.abort();
        logger.warn('Search request timeout', {
          context: 'search_client_timeout',
          timeout: REQUEST_TIMEOUT,
        });
      }, REQUEST_TIMEOUT);

      try {
        const response = await executeSearchRequest(requests, abortController.signal);
        clearTimeout(timeoutId);

        // 🔧 成功请求，重置该 indexName 的错误计数
        if (!isServer) {
          const breaker = getCircuitBreaker(indexName);
          breaker.consecutiveErrors = 0;
          if (breaker.isOpen) {
            logger.info('Circuit breaker closed after successful request', {
              context: 'search_circuit_breaker',
              indexName,
            });
            breaker.isOpen = false;
          }
        }

        // Save successful response to result cache
        if (response && response.results) {
          resultCache.set(requestKey, {
            data: response,
            timestamp: Date.now(),
            hits: response.results?.[0]?.nbHits || 0,
          });

          // Clean expired entries
          cleanExpiredResultCache();

          // Enforce max size
          enforceResultCacheSize();

          logger.debug('Search result cached', {
            context: 'search_result_cache_save',
            hits: response.results?.[0]?.nbHits || 0,
            cacheSize: resultCache.size,
          });
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle request cancellation (user initiated new search or timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          logger.debug('Search request was cancelled', {
            context: 'search_client_cancellation',
          });
          // 取消请求不算错误，不增加错误计数
          return createEmptySearchResponse(requests);
        }

        // Identify error types for logging / Sentry decisions
        const isNetworkError = error instanceof Error && error.name === 'NetworkError';
        const isParseError = error instanceof Error && error.name === 'ParseError';
        const isApiError = error instanceof Error && error.name === 'APIError';

        // CDN/proxy returning non-JSON (e.g., HTML error page) is an infra issue, not a code bug
        const isInfrastructureParseError =
          isParseError && (error as any).contentType && !(error as any).contentType.includes('application/json');

        // 🔧 增加该 indexName 的错误计数，检查是否需要触发熔断
        let breaker;
        if (!isServer) {
          breaker = getCircuitBreaker(indexName);
          breaker.consecutiveErrors++;
          breaker.lastErrorTime = Date.now();

          if (breaker.consecutiveErrors >= ERROR_THRESHOLD) {
            breaker.isOpen = true;
            logger.error('Circuit breaker opened due to consecutive errors', {
              context: 'search_circuit_breaker',
              indexName,
              consecutiveErrors: breaker.consecutiveErrors,
              threshold: ERROR_THRESHOLD,
              errorMessage: error instanceof Error ? error.message : String(error),
            });
          } else {
            logger.warn('Search error detected, tracking consecutive errors', {
              context: 'search_circuit_breaker',
              indexName,
              consecutiveErrors: breaker.consecutiveErrors,
              threshold: ERROR_THRESHOLD,
            });
          }
        }

        // Log error (use warn for network/infrastructure errors, error for others)
        const logFn = isNetworkError || isInfrastructureParseError ? logger.warn : logger.error;
        logFn('Search client request failed', {
          error: error instanceof Error ? error.message : String(error),
          context: 'search_client_wrapper',
          indexName,
          requestCount: requests?.length || 0,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          consecutiveErrors: breaker?.consecutiveErrors,
          isCircuitOpen: breaker?.isOpen,
          ...((isParseError || isApiError) && {
            contentType: (error as any).contentType,
            responsePreview: (error as any).responsePreview,
            status: (error as any).status,
          }),
        });

        // Only report actionable errors to Sentry
        // NetworkErrors (user connectivity) and CDN parse errors are infra noise
        const shouldReportToSentry = !isNetworkError && !isInfrastructureParseError;

        if (shouldReportToSentry) {
          captureStructuredError(error as Error, {
            domain: BUSINESS_DOMAIN.SEARCH,
            severity: BusinessSeverity.HIGH,
            tags: {
              component: 'search_client',
              issue: 'request_failed',
              environment: 'client',
              index_name: indexName,
              circuit_open: String(breaker?.isOpen ?? false),
            },
            extra: {
              requestCount: requests?.length || 0,
              errorMessage: error instanceof Error ? error.message : String(error),
              consecutiveErrors: breaker?.consecutiveErrors,
              ...((isParseError || isApiError) && {
                contentType: (error as any).contentType,
                responsePreview: (error as any).responsePreview,
                status: (error as any).status,
              }),
            },
          });
        }

        // Always return empty response to prevent UI crash
        return createEmptySearchResponse(requests);
      } finally {
        // Remove from pending cache after request completes
        pendingCache.delete(requestKey);
      }
    })();

    // Add to pending cache
    pendingCache.set(requestKey, {
      promise: requestPromise,
      abortController,
      timestamp: Date.now(),
    });

    return requestPromise;
  },
};

/**
 * Execute search request and validate response
 */
async function executeSearchRequest(requests: any[], signal: AbortSignal): Promise<any> {
  try {
    const response = await customFetch(requests, signal);

    // Validate response structure
    if (!response) {
      const error = new Error('Search API returned null/undefined response');
      logger.error('Search API returned null/undefined response', {
        context: 'search_request_validation',
        requestCount: requests?.length || 0,
      });
      captureStructuredError(error, {
        domain: BUSINESS_DOMAIN.SEARCH,
        severity: BusinessSeverity.HIGH,
        tags: {
          component: 'search_client',
          issue: 'null_response',
        },
        extra: {
          requestCount: requests?.length || 0,
          requestSample: requests?.[0]?.params,
        },
      });
      return createEmptySearchResponse(requests);
    }

    // Ensure results array exists
    if (!response.results || !Array.isArray(response.results)) {
      const error = new Error('Search API response missing results array');
      logger.error('Search API response missing results array', {
        context: 'search_request_validation',
        hasResponse: true,
        responseType: typeof response,
        responseKeys: Object.keys(response || {}),
      });
      captureStructuredError(error, {
        domain: BUSINESS_DOMAIN.SEARCH,
        severity: BusinessSeverity.HIGH,
        tags: {
          component: 'search_client',
          issue: 'invalid_response_structure',
        },
        extra: {
          responseType: typeof response,
          responseKeys: Object.keys(response || {}),
          requestCount: requests?.length || 0,
        },
      });
      return createEmptySearchResponse(requests);
    }

    // Validate each result has required fields
    response.results = response.results.map((result: any, index: number) => {
      if (!result) {
        logger.warn('Search result at index is null/undefined', {
          index,
          context: 'search_request_validation',
        });
        return createEmptyResult(requests[index]);
      }

      // Ensure required fields exist with defaults
      return {
        hits: result.hits || [],
        nbHits: result.nbHits || 0,
        page: result.page || 0,
        nbPages: result.nbPages || 0,
        hitsPerPage: result.hitsPerPage || 20,
        query: result.query || '',
        facets: result.facets || {},
        ...result,
      };
    });

    return response;
  } catch (error) {
    // Classify error type for better handling
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        logger.error('Search API network error', {
          context: 'search_request_network',
          error: error.message,
        });
      }
      // Abort errors (timeout or user cancellation)
      else if (error.name === 'AbortError') {
        logger.debug('Search request aborted', {
          context: 'search_request_abort',
        });
      }
      // Other errors
      else {
        logger.error('Search request execution failed', {
          context: 'search_request_execution',
          errorName: error.name,
          errorMessage: error.message,
        });
      }
    }

    // Re-throw to be handled by caller with appropriate context
    throw error;
  }
}

// Helper to create empty search response
function createEmptySearchResponse(requests: any[]) {
  return {
    results: requests.map((request) => createEmptyResult(request)),
  };
}

// Helper to create empty result
function createEmptyResult(request: any) {
  return {
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage: request?.params?.hitsPerPage || 20,
    query: request?.params?.query || '',
    facets: {},
    index: request?.indexName || 'web_product',
  };
}

export interface SearchViewProps {
  indexName?: string;
  sortOptions?: SortOption[];
  showSortBy?: boolean;
  showCategories?: boolean;
  categoryFilter?: string[]; // 分类筛选器：要显示的分类permalink列表
  useInfiniteHits?: boolean;
  defaultShowFilters?: boolean; // 新增：默认是否显示筛选器
  hitsPerPage?: number;
  ruleContexts?: SearchRuleContexts;
  categoriesData?: { permalink: string; name: string }[]; // 新增：分类数据用于标签转换
  filterOrdersData?: FilterOrdersData; // 新增：筛选器排序数据
  categoryPermalink?: string;
  leadTimeItems?: NumericMenuConnectorParamsItem[]; // 新增：合并后的 leadtime filter items
  bottomContent?: React.ReactNode; // 新增：有搜索结果时在底部显示的内容（如推荐轮播）
  enableSearchResultsLoadedTracking?: boolean; // 新增：是否启用搜索结果加载埋点
}

// const instance = createInstantSearchNextInstance();

/**
 * SearchView 客户端组件
 * 提供完整的搜索和筛选UI
 */
export function SearchView({
  indexName = IndexNames[0],
  sortOptions,
  // showSortBy = true,
  useInfiniteHits = false,
  categoryFilter,
  defaultShowFilters = true, // 新增：默认是否显示筛选器
  hitsPerPage = 24,
  ruleContexts,
  categoriesData,
  filterOrdersData,
  categoryPermalink,
  leadTimeItems,
  bottomContent,
  enableSearchResultsLoadedTracking = false, // 新增：默认不启用，只在搜索页面启用
}: SearchViewProps) {
  const [showFilters, setShowFilters] = useState(defaultShowFilters);
  const { desktop } = useBreakpoints();
  const currentZipcodeFromRedux = useAppSelector(selectedCurrentZipcode);

  const effectiveSortOptions = useMemo(() => sortOptions || getSortOptions(), [sortOptions]);

  // Stabilize ruleContexts prop for <Configure> using value-based comparison.
  // ruleContexts from the parent RSC is a new object reference on every render,
  // so we serialize and compare the string to avoid unnecessary re-searches.
  const ruleContextsSerializedRef = useRef<string>('');
  const ruleContextsPropRef = useRef<string[]>([]);

  const ruleContextsProp = useMemo(() => {
    const merged = {
      ...ruleContexts,
      // Redux zipcode takes priority (user's current selection)
      // Falls back to server zipcode if Redux is null
      currentZipcode: currentZipcodeFromRedux || ruleContexts?.currentZipcode || null,
    };
    const serialized = JSON.stringify(merged);

    if (serialized === ruleContextsSerializedRef.current) {
      return ruleContextsPropRef.current;
    }

    ruleContextsSerializedRef.current = serialized;
    ruleContextsPropRef.current = [serialized];
    return ruleContextsPropRef.current;
  }, [ruleContexts, currentZipcodeFromRedux]);

  // Disable smooth scrolling to prevent animated scroll restoration
  // when navigating back from PDP
  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Save original values
    const originalHtmlScrollBehavior = htmlElement.style.scrollBehavior;
    const originalBodyScrollBehavior = bodyElement.style.scrollBehavior;

    // Disable smooth scrolling
    htmlElement.style.scrollBehavior = 'auto';
    bodyElement.style.scrollBehavior = 'auto';

    // Restore on cleanup
    return () => {
      htmlElement.style.scrollBehavior = originalHtmlScrollBehavior;
      bodyElement.style.scrollBehavior = originalBodyScrollBehavior;
    };
  }, []);

  return (
    <Container
      disableGutters={desktop ? false : true}
      sx={{
        mb: 9,
      }}
    >
      <SearchProvider
        categoriesData={categoriesData}
        filterOrdersData={filterOrdersData}
        leadTimeItems={leadTimeItems}
        queryString={ruleContexts?.queryString}
      >
        <InstantSearchNext
          // 不要使用 instance={instance} 因为会导致从SearchPage跳转到PDP页面的时候 URL会变成search
          // instance={instance}
          indexName={indexName}
          searchClient={searchClient}
          future={{
            preserveSharedStateOnUnmount: true,
          }}
          // ignoreMultipleHooksWarning={true} // Uncomment if false warnings appear
          routing={{
            router: {
              cleanUrlOnDispose: false,
              parseURL: ({ qsModule, location }: { qsModule: any; location: any }) => {
                // 解析所有 URL 参数
                const allParams = qsModule.parse(location.search.slice(1));

                // 过滤掉营销参数，只返回搜索相关的参数给 InstantSearch
                // 这样可以避免营销参数被误认为是搜索状态
                const searchParams = Object.fromEntries(
                  Object.entries(allParams).filter(
                    ([key]) =>
                      // 排除营销参数前缀
                      !MARKETING_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix)) &&
                      // 排除特定的营销参数名
                      !MARKETING_PARAM_NAMES.includes(key)
                  )
                );

                return searchParams;
              },
              createURL: ({ qsModule, routeState, location }: { qsModule: any; routeState: any; location: any }) => {
                const { origin, pathname, hash } = location;

                // 从当前 URL 中获取所有查询参数
                const queriesFromUrl = qsModule.parse(location.search.slice(1));

                // 提取所有营销相关的参数（不在搜索状态中的营销参数）
                const marketingParams = Object.fromEntries(
                  Object.entries(queriesFromUrl).filter(
                    ([key]) =>
                      // 保留不在 routeState 中的参数
                      !Object.keys(routeState).includes(key) &&
                      // 并且参数名以营销参数前缀开头，或者是特定的营销参数名
                      (MARKETING_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
                        MARKETING_PARAM_NAMES.includes(key))
                  )
                );

                // 合并搜索状态和营销参数
                const queryString = qsModule.stringify(
                  {
                    ...routeState,
                    ...marketingParams,
                  },
                  {
                    addQueryPrefix: true,
                    arrayFormat: 'indices',
                  }
                );

                return `${origin}${pathname}${queryString}${hash}`;
              },
            },
            stateMapping: singleIndexStateMapping(indexName),
          }}
        >
          {/* 🔧 FIX 1: Use facets=['*'] with explicit disjunctiveFacets to ensure server/client consistency */}
          <Configure facets={['*']} maxValuesPerFacet={999} hitsPerPage={hitsPerPage} ruleContexts={ruleContextsProp} />
          <TrackingMiddleware categoryPermalink={categoryPermalink ?? ''} />
          {enableSearchResultsLoadedTracking && <SearchResultsLoadedTracking />}
          <CustomSearchBox />
          <ScrollTo disable={useInfiniteHits}>
            {/* Desktop Filter Controls */}
            <DesktopFilterControls
              onFilterClick={() => setShowFilters(!showFilters)}
              sortOptions={effectiveSortOptions}
              showFilters={showFilters}
            />

            {/* Mobile Filter Controls */}
            <MobileFilter categoryFilter={categoryFilter} sortOptions={effectiveSortOptions} />

            {/* Main Content Container */}

            {/* Mobile Quickship - only on mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, my: 4, mx: 6 }}>
              <QuickshipToggleRefinementWrapper />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap:
                  EcEnv.NEXT_PUBLIC_CHANNEL === 'POS'
                    ? 0
                    : {
                        md: 5,
                        lg: 10,
                      },
                flexGrow: 1,
              }}
            >
              {/* Desktop Filters Sidebar */}
              {showFilters && (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? '220px' : '224px',
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Box sx={{ position: 'sticky', top: 24 }}>
                    <QuickshipToggleRefinementWrapper />
                    <FacetsContent categoryFilter={categoryFilter} />
                  </Box>
                </Box>
              )}

              {/* Search Results */}
              <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
                {/* <SearchLoading /> */}
                <NoResultsBoundary fallback={<NoResults />}>
                  {useInfiniteHits ? <CustomInfiniteHits showFilters={showFilters} /> : <CustomHits />}
                  {useInfiniteHits ? null : <CustomPagination />}
                </NoResultsBoundary>
              </Box>
            </Box>

            {/* Bottom content - only shown when there are search results */}
            {bottomContent && <HasResultsBoundary>{bottomContent}</HasResultsBoundary>}
          </ScrollTo>
        </InstantSearchNext>
      </SearchProvider>
    </Container>
  );
}
