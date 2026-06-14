import { EcEnv } from '@castlery/config';
import { type ISbStoriesParams, type ISbStoryData, type ISbStoryParams, type StoryblokClient } from '@storyblok/react';
import { unstable_cache as cache } from 'next/cache';
import { cache as reactCache } from 'react';
import { logger } from '@castlery/observability';
import { getTimestamp } from '../utils';

interface StoryblokConfig {
  isTest: boolean;
  version: 'draft' | 'published';
}

// 优化后的缓存数据结构，只包含必要字段
export interface ISbMinimalStoryData {
  name: string;
  uuid: string;
  slug: string;
  full_slug: string;
  path: string | null;
  redirectUrl: string | null;
}

export interface ISbLink {
  id?: number;
  slug?: string;
  name?: string;
  is_folder?: boolean;
  parent_id?: number;
  published?: boolean;
  position?: number;
  uuid?: string;
  is_startpage?: boolean;
  path?: string;
  real_path?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

const isTest = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test');

export class SbBaseService {
  private client: StoryblokClient;
  private config: StoryblokConfig;
  readonly region: string;
  private allStoryCache: ISbStoryData[] = [];
  /**
   * @description React cache 实现记忆化的API请求
   */
  private cachedGetStory = reactCache(async <T>(slug: string, params?: Partial<ISbStoryParams>) => {
    return this.getStory<T>(slug, params);
  });

  private cachedGetStories = reactCache(async <T>(params?: ISbStoriesParams) => {
    return this.getStories<T>(params);
  });

  /**
   * @description 使用 React cache Next.js cache 实现记忆化的API请求
   */
  private cachedGetStoryWithPersistentCache = reactCache(
    async <T>(
      slug: string,
      params?: Partial<ISbStoryParams>,
      options?: {
        tags?: string[];
        revalidate?: number;
      }
    ) => {
      return this.getStoryWithCache<T>(slug, params, options);
    }
  );

  private cachedGetStoriesWithPersistentCache = reactCache(
    async <T>(
      params: ISbStoriesParams,
      options?: {
        tags?: string[];
        revalidate?: number;
      }
    ) => {
      return this.getStoriesWithCache<T>(params, options);
    }
  );

  constructor({ client }: { client: StoryblokClient }) {
    this.client = client;
    this.config = {
      isTest,
      version: isTest ? 'draft' : 'published',
    };
    this.region = `${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/`;
  }

  /**
   * 通过 slug 获取单个故事
   * 依赖方法自带缓存配置
   */
  async getStory<T = any>(slug: string, params?: Partial<ISbStoryParams>) {
    try {
      const { data } = await this.client.getStory(slug, {
        version: this.config.version,
        ...params,
      });
      return data?.story as ISbStoryData<T>;
    } catch (error) {
      logger.error('Failed to getStory', { slug, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async getStoryInRealTime<T = any>(slug: string, params?: Partial<ISbStoryParams>) {
    try {
      const { data } = await this.client.getStory(slug, {
        version: this.config.version,
        cv: getTimestamp(),
        ...params,
      });
      return data?.story as ISbStoryData<T>;
    } catch (error) {
      logger.error('Failed to getStoryInRealTime', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async getAll(slug: string, params?: Partial<ISbStoriesParams>) {
    try {
      const res = await this.client.getAll(slug, {
        version: this.config.version,
        ...params,
      });
      return res as ISbStoryData[];
    } catch (error) {
      logger.error('Failed to getAll', { slug, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async getAllWithCache(
    slug: string,
    params: Partial<ISbStoriesParams>,
    options?: {
      tags?: string[];
      revalidate?: number;
    }
  ) {
    const cacheKey = `sb-all-${slug}-${JSON.stringify(params)}`;
    const { content_type } = params;
    const sbContentTypeTag = `sb-all-${content_type}`;
    return cache(
      async () => {
        const result = await this.getAll(slug, params);
        // 如果结果为 null，抛出错误避免缓存错误数据
        if (result === null) {
          throw new Error(`Failed to fetch all stories for ${slug}`);
        }
        return result;
      },
      [cacheKey],
      {
        tags: ['storyblok', sbContentTypeTag, cacheKey, ...(options?.tags || [])],
        revalidate: options?.revalidate || EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      }
    )();
  }

  // TODO @Wcdaren 这里会获取到全部页面 虽然可以获取拿来 给blog之类的页面使用
  // 但是现在先不推荐这么使用 因为这个会缓存很久 到时做失效之类的不好处理
  // 这里会拿来处理 sitemap 之类的
  async getAllStories(): Promise<ISbMinimalStoryData[]> {
    const cacheKey = 'sb-all-stories-minimal';
    return cache(
      async () => {
        try {
          const allStories = await this.getAll('cdn/stories', {
            starts_with: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/`,
          });
          if (!allStories) return [];

          // 只缓存必要的数据字段，减少内存占用
          return allStories.map((story) => ({
            name: story.name,
            uuid: story.uuid,
            slug: story.slug,
            full_slug: story.full_slug,
            redirectUrl: story.content?.['redirect_url'] || null,
            path: story.path || null,
          }));
        } catch (error) {
          logger.error('Failed to fetch all stories', {
            error: error instanceof Error ? error.message : String(error),
          });
          return [];
        }
      },
      [cacheKey],
      {
        tags: ['storyblok', 'all-stories'],
        revalidate: 5 * 60,
      }
    )();
  }

  async getAllFromGeneralContentV2(): Promise<ISbMinimalStoryData[]> {
    const cacheKey = 'sb-all-stories-minimal-general-content-v2';
    return cache(
      async () => {
        try {
          const allStories = await this.getAll('cdn/stories', {
            starts_with: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/`,
          });
          if (!allStories) return [];

          // 只缓存必要的数据字段，减少内存占用
          return allStories.map((story) => ({
            name: story.name,
            uuid: story.uuid,
            slug: story.slug,
            full_slug: story.full_slug,
            redirectUrl: story.content?.['redirect_url'] || null,
            path: story.path || null,
          }));
        } catch (error) {
          logger.error('Failed to fetch all stories from general content v2', {
            error: error instanceof Error ? error.message : String(error),
            context: 'storyblok_general_content_v2',
          });
          return [];
        }
      },
      [cacheKey],
      {
        tags: ['storyblok', 'all-stories', 'general-content-v2'],
        revalidate: 5 * 60,
      }
    )();
  }

  /**
   * 通过 content_type 获取故事列表
   */
  async getStories<T = any>(params?: ISbStoriesParams) {
    try {
      const { data, perPage, total } = await this.client.getStories({
        version: this.config.version,
        ...params,
      });
      return {
        stories: data.stories as Array<ISbStoryData<T>>,
        total,
        perPage,
      };
    } catch (error) {
      logger.error('Failed to fetch stories', { error, params });
      return {
        stories: [],
        total: 0,
        perPage: params?.per_page || 0,
      };
    }
  }

  // @TODO @Wcdaren 这里的 cacheKey 是不是要像之前收缩在一起管理，webhook 可能会需要用到
  /**
   * 带缓存的获取单个故事
   */
  async getStoryWithCache<T = any>(
    slug: string,
    params?: Partial<ISbStoryParams>,
    options?: {
      tags?: string[];
      revalidate?: number;
    }
  ) {
    const cacheKey = `sb-${slug}-${JSON.stringify(params)}`;
    const sbSlugTag = `sb-${slug}`;

    try {
      return await cache(
        async () => {
          const result = await this.getStoryInRealTime<T>(slug, params);
          // 如果结果为 null，抛出错误避免缓存错误数据
          if (result === null) {
            throw new Error(`Failed to fetch story: ${slug}`);
          }
          return result;
        },
        [cacheKey],
        {
          tags: ['storyblok', sbSlugTag, ...(options?.tags || [])],
          revalidate: options?.revalidate || EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
        }
      )();
    } catch (error) {
      // 捕获错误，记录日志但返回 null，避免破坏调用方
      // 由于在 cache 内部抛出了错误，所以不会缓存 null 值
      logger.warn('Failed to fetch story with cache', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * 带缓存的获取故事列表
   */
  async getStoriesWithCache<T = any>(
    params: ISbStoriesParams,
    options?: {
      tags?: string[];
      revalidate?: number;
    }
  ) {
    const cacheKey = `sb-${JSON.stringify(params)}`;
    const { content_type } = params;
    const sbContentTypeTag = `sb-${content_type}`;

    try {
      return await cache(
        async () => {
          const result = await this.getStories<T>(params);
          // 如果结果对象不存在或 stories 字段不存在（真正的错误），抛出错误避免缓存错误数据
          // 注意：空数组是合法结果，不应抛出错误
          if (!result || !result.stories) {
            throw new Error(`Failed to fetch stories with params: ${JSON.stringify(params)}`);
          }
          return result;
        },
        [cacheKey],
        {
          tags: ['storyblok', sbContentTypeTag, cacheKey, ...(options?.tags || [])],
          revalidate: options?.revalidate || EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
        }
      )();
    } catch (error) {
      // 捕获错误，记录日志但返回空结果，避免破坏调用方
      // 由于在 cache 内部抛出了错误，所以不会缓存错误数据
      logger.warn('Failed to fetch stories with cache', {
        params,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        stories: [],
        total: 0,
        perPage: params?.per_page || 0,
      };
    }
  }

  /**
   * @description React cache 获取单个故事（单个请求生命周期内的记忆化）
   *
   */
  async getStoryWithReactCache<T = any>(slug: string, params?: Partial<ISbStoryParams>) {
    return this.cachedGetStory<T>(slug, params);
  }

  /**
   * @description React cache获取故事列表（单个请求生命周期内的记忆化）
   *
   */
  async getStoriesWithReactCache<T = any>(params?: ISbStoriesParams) {
    return this.cachedGetStories<T>(params);
  }

  /**
   * @description 同时使用React记忆化和Next.js持久缓存获取单个故事
   *
   */
  async getStoryWithBothCache<T = any>(
    slug: string,
    params?: Partial<ISbStoryParams>,
    options?: {
      tags?: string[];
      revalidate?: number;
    }
  ) {
    return this.cachedGetStoryWithPersistentCache<T>(slug, params, options);
  }

  /**
   * @description React cache 和 Next.js cache 获取故事列表
   *
   */
  async getStoriesWithBothCache<T = any>(
    params: ISbStoriesParams,
    options?: {
      tags?: string[];
      revalidate?: number;
    }
  ) {
    return this.cachedGetStoriesWithPersistentCache<T>(params, options);
  }

  async getStoriesWithoutCache<T = any>(params?: ISbStoriesParams) {
    return this.getStories<T>(params);
  }
}
