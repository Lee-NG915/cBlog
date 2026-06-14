import { EcEnv } from '@castlery/config';
import { ISbStoriesParams, StoryblokClient } from '@storyblok/react';
import { unstable_cache } from 'next/cache';
import { isOutdated } from '../../utils';

// Constants
const CONFIG = {
  isTest: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test'),
  defaultRegion: EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase() + '/',
  version: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? 'draft' : 'published',
} as const;

// Types
interface DateRange {
  published_at: string;
  ended_at: string;
}

// Generic filter function for date-based content
const filterValidContent = <T extends DateRange>(items: T[]): T[] => {
  return items.filter((item) => !isOutdated(item.published_at, item.ended_at));
};

// Base Storyblok fetcher with caching
const createCachedFetcher = <T>(
  storyblokApi: StoryblokClient,
  slug: string,
  sbParams: ISbStoriesParams = {},
  transformer?: (data: any) => T
) => {
  return unstable_cache(
    async () => {
      const response = await storyblokApi.get(`cdn/stories/${slug}`, {
        version: CONFIG.version,
        ...sbParams,
      });

      const data = response.data.story.content;
      return transformer ? transformer(data) : data;
    },
    [slug],
    { tags: [`global_${slug}`] }
  );
};

// Specific fetchers
export const getGlobalNavFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}configuration/global-nav`;
  const transformer = (data: any) => {
    const navItems = data.items || [];
    return filterValidContent(navItems);
  };

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getConfigurationNoticeFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}configuration/notice`;
  const transformer = (data: any) => {
    const noticeNum = data.limit_num || 0;
    const filteredNoticeBar = filterValidContent(data.notice || []).slice(0, noticeNum);
    const filteredNoticeMobile = filterValidContent(data.notice_mobile || []).slice(0, noticeNum);

    return {
      noticeBarData: filteredNoticeBar,
      noticeBarMobileData: filteredNoticeMobile,
    };
  };

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getGlobalFooterFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}configuration/footer`;
  const transformer = (data: any) => ({
    footerData: data?.list || [],
    socialList: data?.socialList || [],
    bottomList: data?.bottomList || [],
    mobileList: data?.mobileList || [],
  });

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getGlobalMenuGroupMenuFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}menu-group/menu-a`;
  const transformer = (data: any) => {
    return data.menu_component_data?.map((item) => ({
      ...item,
      blocks: filterValidContent(item.blocks),
    }));
  };

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getGlobalStoryBlokMenuFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}story_bloks/menu`;
  const transformer = (data: any) => data.items;

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getSalePagesFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}sale-pages`;
  const transformer = (data: any) => {
    const allPages = [...(data.sale_pages || []), ...(data.seo_pages || [])];
    return allPages.reduce((acc, item) => {
      const existingIndex = acc.findIndex((page) => page.path === item.path);

      if (existingIndex !== -1) {
        if (!isOutdated(item.publishedAt, item.endedAt)) {
          acc[existingIndex] = item;
        }
      } else {
        acc.push(item);
      }

      return acc;
    }, []);
  };

  return createCachedFetcher(storyblokApi, slug, sbParams, transformer)();
};

export const getPageMapFromCache = async ({
  storyblokApi,
  region = CONFIG.defaultRegion,
  sbParams,
}: {
  storyblokApi: StoryblokClient;
  region?: string;
  sbParams?: ISbStoriesParams;
}) => {
  const slug = `${region}page-map`;
  return createCachedFetcher(storyblokApi, slug, sbParams)();
};
