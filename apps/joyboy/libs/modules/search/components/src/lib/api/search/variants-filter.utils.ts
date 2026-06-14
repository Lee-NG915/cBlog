/**
 * 🛍️ 电商搜索 Variants 过滤工具
 *
 * 【文件目的】
 * 处理 Elasticsearch 搜索结果中的产品变体（variants）过滤逻辑。
 * 主要解决用户同时应用多个过滤条件时（如颜色+交货时间）的 variants 筛选问题。
 *
 * 【核心原理】
 * 利用 Elasticsearch 的 inner_hits 机制，通过交集算法找到同时满足
 * 所有过滤条件的 variants，避免客户端重复过滤。
 *
 * 【适用场景】
 * - 用户同时选择多个过滤条件（颜色、尺寸、交货时间等）
 * - 需要精确匹配所有条件的产品变体
 * - 大量产品数据的高性能过滤场景
 */

import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchResponseBody } from 'searchkit';

// 类型定义
type SpuSource = Record<string, any>;
type SearchRequest = Record<string, any>;

/**
 * 检查一个inner_hit是否包含variants数据
 * 通过检查第一个hit的_nested.field来判断
 */
function isVariantInnerHit(innerHitData: any): boolean {
  if (!innerHitData?.hits?.hits || innerHitData.hits.hits.length === 0) {
    return false;
  }

  const firstHit = innerHitData.hits.hits[0];
  // 检查_nested字段，如果field是variants或variants.*，说明这是variants的inner_hits
  const nestedField = firstHit._nested?.field;
  if (nestedField && (nestedField === 'variants' || nestedField.startsWith('variants.'))) {
    return true;
  }

  // 备用检查：如果_source中有variant特有的字段（如id, price, sku等），也认为是variant
  const source = firstHit._source;
  if (source && source.id && (source.price !== undefined || source.sku)) {
    return true;
  }

  return false;
}

/**
 * 从 Elasticsearch inner_hits 中提取 variants 数据
 *
 * 【核心原理 - 简化版】
 * Elasticsearch 的 inner_hits 告诉我们：经过所有过滤条件后，哪些嵌套文档仍然匹配。
 * 我们的任务很简单：
 * 1. 如果有任何 variants 相关的 inner_hits，就从中提取 variants（可能需要计算交集）
 * 2. 如果完全没有 variants 的 inner_hits，说明没有应用variants相关过滤，保留原始variants
 *
 * 【为什么需要交集逻辑】
 * 当用户同时应用多个variants过滤条件时（如：颜色 + 交货时间），Elasticsearch 为每个条件
 * 创建单独的 inner_hits。我们需要找到同时满足所有条件的 variants。
 *
 * 【实际案例】
 * 用户搜索：绿色沙发 + 3-15天交货
 * - "variants" inner_hits: [variant_A(白色,14天), variant_B(绿色,14天)]  ← numericFilters 结果
 * - "variants.color" inner_hits: [variant_B(绿色,14天), variant_C(绿色,131天)]  ← facetFilters 结果
 * - 交集结果: [variant_B(绿色,14天)]  ← 同时满足两个条件
 *
 * @param innerHits Elasticsearch 返回的 inner_hits 对象
 * @param originalVariants 原始的 variants 数组，用于无variants过滤时的fallback
 * @returns 经过过滤后的 variants 数组
 */
function extractVariantsFromInnerHits(innerHits: any, originalVariants: any[] = []): any[] {
  // 🔧 修复：通过检查实际内容来识别variants inner_hits，而不是依赖键名
  // 这样可以处理任意命名格式的inner_hits（如 "variants_r0_bool_filter_4"）
  const variantRelatedKeys = Object.keys(innerHits).filter((key) => {
    return isVariantInnerHit(innerHits[key]);
  });

  // 【修复】如果有任何 variants 相关的 inner_hits，都应该用于过滤 variants
  // numericFilters 产生的 "variants" inner_hits 同样重要，需要参与交集计算
  if (variantRelatedKeys.length > 0) {
    return extractVariantsFromVariantInnerHits(innerHits, variantRelatedKeys);
  }

  // 【fallback】没有任何 variants 相关的 inner_hits，返回原始 variants
  // 这种情况发生在：
  // - 没有任何 variants 过滤的场景（如只有 category 过滤）
  // - swatches 过滤、categories 过滤等不影响 variants 的场景
  return originalVariants;
}

/**
 * 专门处理 variants.* inner_hits 的交集逻辑
 * 从原有逻辑中分离出来，保持功能不变
 */
function extractVariantsFromVariantInnerHits(innerHits: any, variantInnerHitKeys: string[]): any[] {
  if (variantInnerHitKeys.length === 0) {
    return [];
  }

  // 【情况1】只有一个 inner_hits 键，直接使用其结果
  // 这种情况通常发生在只应用了一种过滤条件时
  if (variantInnerHitKeys.length === 1) {
    const innerHitKey = variantInnerHitKeys[0];
    const innerHitData = innerHits[innerHitKey];
    const extractedVariants: any[] = [];

    if (innerHitData?.hits?.hits) {
      innerHitData.hits.hits.forEach((innerHit: any) => {
        if (innerHit._source) {
          extractedVariants.push(innerHit._source);
        }
      });
    }

    return extractedVariants;
  }

  // 【情况2】有多个 inner_hits 键，需要计算交集
  // 这种情况发生在同时应用了多种过滤条件时（如：颜色 + 交货时间）

  // 存储每个 inner_hits 中的 variant ID 集合
  const variantIdSets: Set<number>[] = [];
  // 存储所有 variant 对象的映射，key 是 variant ID
  const allVariantsMap = new Map<number, any>();

  // 遍历每个 inner_hits，收集其包含的 variant IDs
  variantInnerHitKeys.forEach((innerHitKey) => {
    const innerHitData = innerHits[innerHitKey];
    const variantIds = new Set<number>();

    if (innerHitData?.hits?.hits) {
      innerHitData.hits.hits.forEach((innerHit: any) => {
        if (innerHit._source?.id) {
          variantIds.add(innerHit._source.id);
          // 同时保存 variant 对象以便后续使用
          allVariantsMap.set(innerHit._source.id, innerHit._source);
        }
      });
    }

    variantIdSets.push(variantIds);
  });

  // 计算所有 inner_hits 的交集
  // 只有同时出现在所有 inner_hits 中的 variant 才会被保留
  let intersectionIds = variantIdSets[0];
  for (let i = 1; i < variantIdSets.length; i++) {
    intersectionIds = new Set([...intersectionIds].filter((id) => variantIdSets[i].has(id)));
  }

  // 将交集 ID 转换回 variant 对象
  const extractedVariants = Array.from(intersectionIds)
    .map((id) => allVariantsMap.get(id))
    .filter(Boolean);

  return extractedVariants;
}

/**
 * 处理搜索响应中的 variant 过滤逻辑（主函数）
 *
 * 【背景问题】
 * 在电商搜索中，一个产品（SPU）通常有多个变体（variants），如不同颜色、尺寸等。
 * 用户可能会同时应用多个过滤条件，比如：
 * - facetFilters: [["color:green"]] （颜色过滤）
 * - numericFilters: ["lead_time>=3", "lead_time<=15"] （交货时间过滤）
 * @param responses Elasticsearch 搜索响应数组
 * @param requests 搜索请求数组（当前未使用，保留为了接口兼容性）
 * @returns 处理后的搜索响应数组
 */
export function processSearchResponseWithVariantFiltering(
  responses: ElasticsearchResponseBody[],
  requests: SearchRequest[]
): ElasticsearchResponseBody[] {
  if (!responses || responses.length === 0) return responses;

  // 处理搜索响应 - 使用 Elasticsearch inner_hits 的交集数据
  const filteredResponses = responses.map((response, index) => {
    // 【重要】只处理主搜索响应（index 0）
    // Elasticsearch 通常返回多个响应，第一个是主搜索结果，后续可能是 facets 等辅助数据
    if (index === 0 && response.hits?.hits) {
      const processedHits = response.hits.hits.map((hit) => {
        if (hit._source) {
          // 获取原始 variants 数组
          const originalVariants = Array.isArray(hit._source.variants) ? hit._source.variants : [];

          if (hit.inner_hits) {
            // 从 inner_hits 中提取经过交集计算的 variants
            const extractedVariants = extractVariantsFromInnerHits(hit.inner_hits, originalVariants);

            // 【关键修复】始终更新 variants，即使结果为空
            // 如果交集为空，说明没有 variants 同时满足所有过滤条件
            // 这时应该设置为空数组，而不是保留原始的未过滤数据
            hit._source.variants = extractedVariants;
          } else {
            // 【修复】没有 inner_hits 时，保留原始 variants
            // 这种情况通常发生在：
            // 1. 没有任何 variants 相关的过滤
            // 2. 只有 numericFilters 等不影响 variants 的过滤
            hit._source.variants = originalVariants;
          }
        }
        return hit;
      });

      // 过滤掉 variants 为空的产品
      const validHits = processedHits.filter(
        (hit) => Array.isArray(hit._source?.variants) && hit._source.variants.length > 0
      );

      // 从对应的请求中获取 hitsPerPage
      const correspondingRequest = requests[index];
      const hitsPerPage = correspondingRequest?.request?.params?.hitsPerPage || 20;

      // 🎯 关键修复：基于过滤比例估算总数
      const originalHitsCount = response.hits?.hits?.length || 0;
      const validHitsCount = validHits.length;

      // 如果原始结果为0，直接返回0
      if (originalHitsCount === 0) {
        return {
          ...response,
          hits: {
            ...response.hits,
            hits: validHits,
            total: typeof response.hits.total === 'number' ? 0 : { ...response.hits.total, value: 0 },
          },
          nbHits: 0,
          nbPages: 0,
        } as ElasticsearchResponseBody;
      }

      // 计算有效产品的比例
      const validRatio = validHitsCount / originalHitsCount;

      // 基于比例估算总的有效产品数
      const originalTotal =
        typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0;

      const estimatedValidTotal = Math.round(originalTotal * validRatio);
      const estimatedNbPages = Math.ceil(estimatedValidTotal / hitsPerPage);

      return {
        ...response,
        hits: {
          ...response.hits,
          hits: validHits,
          total:
            typeof response.hits.total === 'number'
              ? estimatedValidTotal
              : { ...response.hits.total, value: estimatedValidTotal },
        },
        nbHits: estimatedValidTotal,
        nbPages: estimatedNbPages,
      } as ElasticsearchResponseBody;
    }
    return response;
  });

  return filteredResponses;
}
