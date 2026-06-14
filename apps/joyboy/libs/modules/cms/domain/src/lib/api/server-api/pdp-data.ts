import { EcEnv } from '@castlery/config';
import type { DataBucketStoryblok, PdpSelectorConfigStoryblok } from '@castlery/types';
import type { ISbStoryData, ISbStoryParams } from '@storyblok/react';
import { logger } from '@castlery/observability/server';
import { unstable_cache } from 'next/cache';
import { CMS_PATHS } from '../../slice/slice';
import { cache as reactCache } from 'react';
import moment from 'moment-timezone';
/**
 * 执行 API 请求，所有错误都返回 null 并缓存
 */
async function _fetchPdpDataBucket(
  slug: string,
  params?: Partial<ISbStoryParams>
): Promise<ISbStoryData<DataBucketStoryblok> | null> {
  // 构建API URL相关信息（提前定义以便在catch中使用）
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  const path = `${region}/${CMS_PATHS.PDP.DATA_BUCKET}/${slug}`;

  const nowDate = moment.tz(EcEnv.NEXT_PUBLIC_TIME_ZONE as string).unix();

  try {
    const token = EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN;
    const version = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? 'draft' : 'published';
    let url = `https://api.storyblok.com/v2/cdn/stories/${path}?token=${token}&version=${version}&cv=${nowDate}`;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== 'version' && key !== 'token') {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      if (response.status >= 400 && response.status < 500) {
        logger.warn('PDPDataBucket client error', { status: response.status, slug, path });
        return null;
      }

      if (response.status >= 500) {
        logger.error('Failed to fetch PDPDataBucket', { status: response.status, slug, path });
        return null;
      }
    }

    const data = await response.json();
    return data.story;
  } catch (error) {
    logger.error('PDPDataBucket network/parse error', { slug, path, error: String(error) });
    return null;
  }
}

/**
 * 持久化缓存层，使用 unstable_cache 包装
 * 缓存键只基于 slug，params 不影响缓存键
 */
function _createCachedFetcher(
  slug: string,
  params?: Partial<ISbStoryParams>,
  cacheOptions?: {
    tags?: string[];
    revalidate?: number;
  }
) {
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  const path = `${region}/${CMS_PATHS.PDP.DATA_BUCKET}/${slug}`;
  const cacheKey = `pdp-data-bucket-${slug}`;
  const tags = ['pdp-data-bucket', cacheKey, path];
  if (cacheOptions?.tags) {
    tags.push(...cacheOptions.tags);
  }
  const revalidate = cacheOptions?.revalidate ?? 600;

  return unstable_cache(() => _fetchPdpDataBucket(slug, params), [cacheKey], {
    tags,
    revalidate,
  });
}

/**
 * 请求级别去重层，使用 React cache 包装
 */
const _cachedGetPdpDataBucket = reactCache(
  async (
    slug: string,
    params?: Partial<ISbStoryParams>,
    cacheOptions?: {
      tags?: string[];
      revalidate?: number;
    }
  ): Promise<ISbStoryData<DataBucketStoryblok> | null> => {
    const cachedFetcher = _createCachedFetcher(slug, params, cacheOptions);
    return await cachedFetcher();
  }
);

/**
 * 服务端获取 PDP 数据桶内容（带双层缓存）
 * 缓存键只基于 slug，params 不影响缓存键
 */
export async function getPdpDataBucketServer(
  slug: string,
  params?: Partial<ISbStoryParams>,
  cacheOptions?: {
    tags?: string[];
    revalidate?: number;
  }
): Promise<ISbStoryData<DataBucketStoryblok> | null> {
  return _cachedGetPdpDataBucket(slug, params, cacheOptions);
}

/**
 * 服务端获取PDP selector配置（带缓存和超时）
 *
 * @param slug - Storyblok路径（不包含region前缀）
 * @param timeoutMs - 超时时间（毫秒），默认2000ms
 * @param params - Storyblok查询参数
 * @param cacheOptions - 缓存配置选项
 * @returns 返回Storyblok故事数据，超时或失败时返回null
 */
export async function getPdpSelectorConfigServer(
  slug: string,
  timeoutMs = 2000,
  params?: Partial<ISbStoryParams>,
  cacheOptions?: {
    tags?: string[];
    revalidate?: number;
    noCache?: boolean;
  }
): Promise<ISbStoryData<PdpSelectorConfigStoryblok> | null> {
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  const path = `${region}/${slug}`;
  const nowDate = moment.tz(EcEnv.NEXT_PUBLIC_TIME_ZONE as string).unix();

  try {
    const token = EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN;
    const version = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? 'draft' : 'published';

    // Intentionally use a fresh cv so Storyblok acts as the source of truth.
    // Cache invalidation is controlled by Next.js cache/revalidateTag, not Storyblok CDN.
    let url = `https://api.storyblok.com/v2/cdn/stories/${path}?token=${token}&version=${version}&cv=${nowDate}`;

    // 添加其他查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== 'version' && key !== 'token' && key !== 'cv') {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 根据 noCache 选项决定是否使用缓存
      const fetchOptions: RequestInit = {
        signal: controller.signal,
      };

      if (cacheOptions?.noCache) {
        // 禁用缓存
        fetchOptions.cache = 'no-store';
      } else {
        // 默认缓存配置
        const defaultTags = [`${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${CMS_PATHS.PDP.SELECTOR}`];
        const defaultRevalidate = 3600; // 1小时缓存

        // 合并用户提供的缓存配置
        const tags = [...defaultTags, ...(cacheOptions?.tags || [])];
        const revalidate = cacheOptions?.revalidate ?? defaultRevalidate;

        // 使用 fetch 的 next 选项进行缓存
        fetchOptions.next = {
          tags,
          revalidate,
        };
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 404 是正常情况（配置未找到），使用 warn 级别
        if (response.status === 404) {
          logger.warn('PDP selector config not found', { slug, path });
          return null;
        }

        // 其他 4xx 客户端错误使用 warn 级别
        if (response.status >= 400 && response.status < 500) {
          logger.warn('PDP selector config client error', { status: response.status, slug, path });
        }
        // 5xx 服务器错误使用 error 级别
        else if (response.status >= 500) {
          logger.error('Failed to fetch PDP selector config', { status: response.status, slug, path });
        }

        return null;
      }

      const data = await response.json();
      return data.story;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // 检查是否是超时错误
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.warn('PDP selector config fetch timeout', { slug, timeoutMs, path });
        return null;
      }

      throw fetchError;
    }
  } catch (error) {
    // 网络错误或解析错误
    logger.error('Error fetching PDP selector config', {
      error: error instanceof Error ? error.message : String(error),
      slug,
      path,
    });
    return null;
  }
}
