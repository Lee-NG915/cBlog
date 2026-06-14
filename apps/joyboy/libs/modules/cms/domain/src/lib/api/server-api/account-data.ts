import { EcEnv } from '@castlery/config';
import type { DataBucketStoryblok, TermsWithVersionStoryblok } from '@castlery/types';
import type { ISbStoryData, ISbStoryParams } from '@storyblok/react';
import { CMS_PATHS } from '../../slice';
import { logger } from '@castlery/observability/server';
/**
 * 服务端获取TermsOfUse内容
 *
 * @param params - Storyblok查询参数
 * @param cacheOptions - 缓存选项
 * @returns 返回Storyblok故事数据
 */
export async function getTermsOfUseServer(
  params?: Partial<ISbStoryParams>,
  cacheOptions?: {
    tags?: string[];
    revalidate?: number;
  }
): Promise<ISbStoryData<TermsWithVersionStoryblok> | null> {
  try {
    // 构建API URL
    const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
    const token = EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN;
    const version = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? 'draft' : 'published';
    const path = `${region}/${CMS_PATHS.TERMS_OF_USE}`;

    // 构建请求URL和参数
    let url = `https://api.storyblok.com/v2/cdn/stories/${path}?token=${token}&version=${version}`;

    // 添加其他查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }

    // 默认缓存标签
    const tags = [`${CMS_PATHS.TERMS_OF_USE}`];
    if (cacheOptions?.tags) {
      tags.push(...cacheOptions.tags);
    }

    // 执行请求
    const response = await fetch(url, {
      next: {
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
        tags,
        ...(cacheOptions?.revalidate !== undefined ? { revalidate: cacheOptions.revalidate } : {}),
      },
    });

    if (!response.ok) {
      logger.error('Failed to fetch TermsOfUse', { status: response.status, path: CMS_PATHS.TERMS_OF_USE });
      return null;
    }

    const data = await response.json();
    return data.story;
  } catch (error) {
    logger.error('Error fetching TermsOfUse', { error, path: CMS_PATHS.TERMS_OF_USE });
    return null;
  }
}
