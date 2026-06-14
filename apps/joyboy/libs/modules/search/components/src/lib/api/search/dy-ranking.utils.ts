import { EcEnv } from '@castlery/config';
import type { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { logger } from '@castlery/observability/server';
import CircuitBreaker from 'opossum';

// Simplified DY types - inline instead of separate file
export interface DyCookies {
  dyid: string;
  dyidServer: string;
  dySession: string;
  dyNewUser: string;
  dyPageLocation: string;
  ipAddress: string;
}

export interface DyRankingContext {
  dyCookies: DyCookies;
  categoryContext: string[] | null;
  currentUrl: string;
  dyApiPreview?: string; // Preview ID for DY API preview mode (from dyApiPreview URL param)
}

// 🔧 优化：使用 Opossum 熔断器
// 如果DY API连续失败，暂时停止调用以避免影响搜索性能

/**
 * DY API 调用函数（用于熔断器包装）
 */
async function callDyApi(payload: any): Promise<any> {
  const url = 'https://dy-api.com/v2/serve/user/choose';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'dy-api-key': EcEnv.DY_SERVER_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`DY API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 熔断器配置
const breakerOptions = {
  timeout: 3000, // 3秒超时
  errorThresholdPercentage: 50, // 错误率超过50%时熔断
  resetTimeout: 60000, // 60秒后尝试恢复（Half-Open）
  rollingCountTimeout: 10000, // 10秒统计窗口
  rollingCountBuckets: 10, // 10个统计桶
  volumeThreshold: 3, // 至少3个请求后才开始统计
  name: 'dyApiBreaker', // 熔断器名称
};

// 创建熔断器实例
const dyCircuitBreaker = new CircuitBreaker(callDyApi, breakerOptions);

// 降级函数：返回空数组（表示没有 DY 排序）
dyCircuitBreaker.fallback(() => {
  logger.warn('DY ranking fallback triggered', {
    context: 'dy_circuit_breaker_fallback',
  });
  return null;
});

// 事件监听 - 用于日志和监控
dyCircuitBreaker.on('open', () => {
  logger.warn('DY API circuit breaker opened - too many failures', {
    stats: dyCircuitBreaker.stats,
    context: 'dy_circuit_breaker',
  });
});

dyCircuitBreaker.on('halfOpen', () => {
  logger.info('DY API circuit breaker half-open - testing recovery', {
    context: 'dy_circuit_breaker',
  });
});

dyCircuitBreaker.on('close', () => {
  logger.info('DY API circuit breaker closed - service recovered', {
    context: 'dy_circuit_breaker',
  });
});

dyCircuitBreaker.on('timeout', () => {
  logger.warn('DY API request timeout', {
    timeout: breakerOptions.timeout,
    context: 'dy_circuit_breaker_timeout',
  });
});

dyCircuitBreaker.on('reject', () => {
  logger.warn('DY API request rejected - circuit is open', {
    context: 'dy_circuit_breaker_reject',
  });
});

/**
 * Check if DY ranking should be applied based on search context
 */
export function shouldApplyDyRanking(searchRequest: any): boolean {
  try {
    // Skip DY ranking in POS environment - not needed for internal staff usage
    if (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS') {
      logger.debug('Skipping DY ranking in POS environment', {
        context: 'dy_ranking_evaluation',
      });
      return false;
    }

    // Check if DY API keys are available
    if (!EcEnv.DY_SERVER_API_KEY && !EcEnv.NEXT_PUBLIC_DY_CLIENT_API_KEY) {
      return false;
    }

    // Don't apply ranking if there's a search query (user is actively searching)
    const mustArray = searchRequest?.body?.query?.bool?.must;
    const hasSearchQuery =
      (Array.isArray(mustArray) &&
        mustArray.some(
          (must: any) => must.multi_match || must.match || must.query_string || must.simple_query_string
        )) ||
      (mustArray && typeof mustArray === 'object' && !mustArray.match_all);

    // Don't apply ranking if there's explicit sorting (beyond default _score + rank)
    const sortArray = searchRequest?.body?.sort;
    const hasCustomSort =
      sortArray &&
      ((Array.isArray(sortArray) && sortArray.length > 0) ||
        (typeof sortArray === 'object' && !Array.isArray(sortArray))) &&
      !isDefaultSort(sortArray);

    // Don't apply ranking if it's a quickship query (based on filters)
    const filterArray = searchRequest?.body?.query?.bool?.filter;
    const hasQuickshipFilter =
      Array.isArray(filterArray) &&
      filterArray.some((filter: any) => {
        // Check for nested query with in_stock_regions terms filter
        const nestedMustArray = filter?.nested?.query?.bool?.must;
        if (Array.isArray(nestedMustArray)) {
          return nestedMustArray.some((must: any) => must?.terms && must.terms['variants.in_stock_regions']);
        }
        // Check for nested query with in_stock_regions term filter (single value)
        const nestedShouldArray = filter?.bool?.should;
        if (Array.isArray(nestedShouldArray)) {
          return nestedShouldArray.some((should: any) => {
            const nestedQuery = should?.nested?.query?.bool?.should;
            if (Array.isArray(nestedQuery)) {
              return nestedQuery.some((q: any) => q?.term && q.term['variants.in_stock_regions']);
            }
            return false;
          });
        }
        return false;
      });

    const result = !hasSearchQuery && !hasCustomSort && !hasQuickshipFilter;

    // Log the decision for debugging
    logger.debug('DY ranking decision made', {
      decision: result ? 'APPLY' : 'SKIP',
      hasSearchQuery,
      hasCustomSort,
      hasQuickshipFilter,
      context: 'dy_ranking_evaluation',
    });

    return result;
  } catch (error) {
    logger.error('Error evaluating DY ranking conditions', {
      error: error instanceof Error ? error.message : String(error),
      context: 'dy_ranking_evaluation',
    });
    return false;
  }
}

/**
 * Check if the sort is the default sort (_score desc, rank asc)
 */
function isDefaultSort(sort: any): boolean {
  if (sort && typeof sort === 'object' && !Array.isArray(sort)) {
    return false;
  }

  if (!Array.isArray(sort) || sort.length !== 2) {
    return false;
  }

  const firstSort = sort[0];
  const secondSort = sort[1];
  const firstScoreOrder = firstSort._score?.order || firstSort._score;
  const secondRankOrder = secondSort.rank?.order || secondSort.rank;

  return firstSort._score && firstScoreOrder === 'desc' && secondSort.rank && secondRankOrder === 'asc';
}

/**
 * Extract SKUs from search hits
 */
function extractSkusFromHits(hits: SearchHit[]): string[] {
  return hits.map((hit) => (hit._source as any)?.variants?.[0]?.sku).filter(Boolean);
}

/**
 * DY tracking metadata attached to each hit for click engagement reporting
 */
export interface DyTrackingMetadata {
  decisionId: string;
  variationId: string;
  slotId: string;
}

/**
 * Call DY API for ranking and reorder hits
 * This function is only called on the server side
 *
 * 🔧 优化：使用 Opossum 熔断器
 * - 自动超时控制（3秒）
 * - 基于错误率的熔断（50%）
 * - Half-Open 状态自动恢复测试
 * - 滚动窗口统计（10秒）
 *
 * 🔧 重要：此函数会将 DY 返回的追踪 ID (decisionId, variationId, slotId) 附加到每个产品上
 * 这些 ID 用于后续的点击事件上报，确保 DY 看板能正确统计点击数据
 */
export async function applyDyRanking(hits: SearchHit[], dyRanking: DyRankingContext | undefined): Promise<SearchHit[]> {
  const startTime = Date.now();

  try {
    // Validate dyRanking parameter exists
    if (!dyRanking) {
      logger.debug('DY ranking skipped - no dyRanking context provided', {
        context: 'dy_ranking_execution',
      });
      return hits;
    }

    const skus = extractSkusFromHits(hits);
    if (skus.length === 0) {
      return hits;
    }

    const { dyCookies, currentUrl, categoryContext } = dyRanking;
    if (!dyCookies || !dyCookies.dyid) {
      return hits;
    }

    // Since this only runs on server side, use server-side logic for newUser
    const newUser = dyCookies.dyid ? 'false' : 'true';

    const payload = {
      user: {
        dyid: dyCookies.dyid,
        dyid_server: dyCookies.dyidServer,
      },
      session: {
        dy: dyCookies.dySession,
      },
      context: {
        page: {
          type: 'CATEGORY',
          location: currentUrl || `${EcEnv.NEXT_PUBLIC_BASE_URL}`,
          data: categoryContext || [],
        },
        device: {
          ip: dyCookies.ipAddress,
        },
        pageAttributes: {
          newUser,
        },
      },
      options: {
        isImplicitPageview: true,
        returnAnalyticsMetadata: false,
        recsProductData: {
          skusOnly: true,
        },
      },
      selector: {
        names: ['PLP Ranking'],
        preview: { ids: dyRanking.dyApiPreview ? [dyRanking.dyApiPreview] : [] },
        args: {
          'PLP Ranking': {
            realtimeRules: [
              {
                type: 'include',
                slots: [],
                query: {
                  conditions: [
                    {
                      field: 'sku',
                      arguments: skus.map((sku) => ({
                        action: 'IS',
                        value: sku,
                      })),
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    };
    logger.debug('DY ranking payload', {
      payload,
      context: 'dy_ranking_execution',
    });

    // 🔧 优化：使用 Opossum 熔断器调用 DY API
    // 熔断器自动处理超时、错误率统计、降级等
    const data = await dyCircuitBreaker.fire(payload);

    // 如果熔断器降级返回 null，使用原始排序
    if (!data) {
      logger.info('DY ranking skipped - using fallback', {
        skuCount: skus.length,
        context: 'dy_ranking_fallback',
      });
      return hits;
    }

    const choices = data.choices || [];

    // Extract DY tracking metadata for click engagement reporting
    const decisionId = choices?.[0]?.decisionId || '';
    const variationId = choices?.[0]?.variations?.[0]?.id || '';
    const slots = choices?.[0]?.variations?.[0]?.payload?.data?.slots || [];

    // Create a map of SKU to slotId for quick lookup
    const skuToSlotIdMap = new Map<string, string>();
    slots.forEach((slot: any) => {
      if (slot.sku && slot.slotId) {
        skuToSlotIdMap.set(slot.sku, slot.slotId);
      }
    });

    // Extract reordered SKUs
    const rankedSkus: string[] = slots.map((slot: any) => slot.sku).filter(Boolean);

    // Reorder hits if we got ranked SKUs
    if (rankedSkus.length > 0) {
      const skuToHitMap = new Map<string, SearchHit>();
      hits.forEach((hit) => {
        const sku = (hit._source as any)?.variants?.[0]?.sku;
        if (sku) {
          skuToHitMap.set(sku, hit);
        }
      });

      const reorderedHits: SearchHit[] = [];
      const usedHits = new Set<string>();

      // Add hits in DY ranking order and attach tracking metadata
      rankedSkus.forEach((sku) => {
        const hit = skuToHitMap.get(sku);
        if (hit) {
          // 🔧 关键：将 DY 追踪 ID 附加到产品数据上，用于后续点击事件上报
          const slotId = skuToSlotIdMap.get(sku) || '';
          const enhancedHit: SearchHit = {
            ...hit,
            _source: {
              ...(hit._source as any),
              dyTracking: {
                decisionId,
                variationId,
                slotId,
              } as DyTrackingMetadata,
            },
          };
          reorderedHits.push(enhancedHit);
          usedHits.add(hit._id!);
        }
      });

      // Add remaining hits (without DY tracking metadata since they weren't ranked by DY)
      hits.forEach((hit) => {
        if (!usedHits.has(hit._id!)) {
          reorderedHits.push(hit);
        }
      });

      const duration = Date.now() - startTime;

      logger.info('DY ranking successfully applied', {
        originalHitsCount: hits.length,
        reorderedHitsCount: reorderedHits.length,
        rankedSkusCount: rankedSkus.length,
        hasDecisionId: !!decisionId,
        hasVariationId: !!variationId,
        slotsWithIds: skuToSlotIdMap.size,
        duration,
        breakerStats: {
          failures: dyCircuitBreaker.stats.failures,
          successes: dyCircuitBreaker.stats.successes,
          timeouts: dyCircuitBreaker.stats.timeouts,
          rejects: dyCircuitBreaker.stats.rejects,
        },
        context: 'dy_ranking_execution',
      });
      return reorderedHits;
    }

    // 没有排序结果，返回原始排序
    logger.info('DY ranking returned no results - using original order', {
      skuCount: hits.length,
      context: 'dy_ranking_execution',
    });
    return hits;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Opossum 会自动处理错误统计和熔断，这里只需要记录日志
    logger.error('DY ranking failed with error', {
      error: errorMessage,
      skuCount: hits?.length || 0,
      hasValidContext: !!dyRanking?.dyCookies?.dyid,
      duration,
      breakerStats: {
        failures: dyCircuitBreaker.stats.failures,
        successes: dyCircuitBreaker.stats.successes,
        timeouts: dyCircuitBreaker.stats.timeouts,
        rejects: dyCircuitBreaker.stats.rejects,
        isOpen: dyCircuitBreaker.opened,
      },
      context: 'dy_ranking_execution',
    });

    return hits;
  }
}
