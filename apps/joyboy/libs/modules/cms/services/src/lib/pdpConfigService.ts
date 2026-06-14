import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability';
import { PdpSelectorConfigStoryblok, PDPConfig, SpuGroup, SpuIndexEntry } from '@castlery/types';
import { cache as reactCache } from 'react';
import { unstable_cache } from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import { PDP_CONFIG_FALLBACK } from '../fallback_resource/pdp-config-fallback';
import { buildIndexMapAndBaseStructure, applyCurrentSlugToUiTree } from '@castlery/utils';
import { getPdpSelectorConfigServer, CMS_PATHS } from '@castlery/modules-cms-domain/server';

/**
 * 获取原始配置（静态函数）
 * 直接使用 getPdpSelectorConfigServer 获取配置，不再依赖 sbService
 */
async function fetchRawConfig(): Promise<PdpSelectorConfigStoryblok | null> {
  const slug = CMS_PATHS.PDP.SELECTOR;
  const timeoutMs = 2000;

  try {
    const story = await getPdpSelectorConfigServer(slug, timeoutMs, undefined, { noCache: true });

    if (!story?.content) {
      logger.warn('PDP selector config story not found, using fallback', {
        slug,
        country: EcEnv.NEXT_PUBLIC_COUNTRY,
      });
      return PDP_CONFIG_FALLBACK;
    }

    return story.content;
  } catch (error) {
    logger.error('Failed to fetch PDP config from Storyblok', {
      error: error instanceof Error ? error.message : String(error),
      slug,
      country: EcEnv.NEXT_PUBLIC_COUNTRY,
    });
    Sentry.captureException(error, {
      tags: { component: 'pdpConfigService', country: EcEnv.NEXT_PUBLIC_COUNTRY },
    });

    return PDP_CONFIG_FALLBACK;
  }
}

/**
 * 获取索引 Map 和基础结构（静态函数，不依赖 currentSlug）
 * 这个函数的结果会被全局缓存，因为 indexMap 是全局的映射
 */
async function getIndexMapAndBaseStructureInternal(): Promise<{
  indexMap: Record<string, SpuIndexEntry>;
  baseSpuGroups: SpuGroup[];
  raw: PdpSelectorConfigStoryblok | null;
}> {
  const rawConfig = await fetchRawConfig();
  const { indexMap, baseSpuGroups } = buildIndexMapAndBaseStructure(rawConfig);
  return { indexMap, baseSpuGroups, raw: rawConfig };
}

/**
 * 使用 unstable_cache 缓存索引 Map 和基础结构（静态函数）
 * 这个缓存是全局的，不依赖 currentSlug，所有 slug 共享同一个缓存
 */
const getIndexMapAndBaseStructureWithCache = unstable_cache(getIndexMapAndBaseStructureInternal, ['pdp-config'], {
  tags: [`${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${CMS_PATHS.PDP.SELECTOR}`],
  revalidate: 3600,
});

/**
 * 使用 reactCache 进行单次渲染周期去重的索引 Map 和基础结构
 * 在同一个渲染周期内，多次调用会复用同一个结果
 */
const getCachedIndexMapAndBaseStructure = reactCache(
  async (): Promise<{
    indexMap: Record<string, SpuIndexEntry>;
    baseSpuGroups: SpuGroup[];
    raw: PdpSelectorConfigStoryblok | null;
  }> => {
    return await getIndexMapAndBaseStructureWithCache();
  }
);

/**
 * 获取缓存的 PDP 配置（静态函数）
 * @param currentSlug 当前页面的产品 slug，用于计算 isActive 和 isCurrent 状态
 * @returns PDP 配置对象，包含 indexMap 和 uiTree
 */
export async function getCachedPDPConfig(currentSlug?: string): Promise<PDPConfig> {
  const { indexMap, baseSpuGroups, raw } = await getCachedIndexMapAndBaseStructure();

  const filteredSpuGroups = applyCurrentSlugToUiTree(indexMap, baseSpuGroups, currentSlug);

  return {
    indexMap,
    uiTree: { spuGroups: filteredSpuGroups },
    raw,
  };
}
