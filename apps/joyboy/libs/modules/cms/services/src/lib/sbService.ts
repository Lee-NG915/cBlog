import { EcEnv } from '@castlery/config';
import { CMS_PATHS } from '@castlery/modules-cms-domain';
import {
  BlogBannerStoryblok,
  BlogPageStoryblok,
  DataBucketStoryblok,
  FooterV2Storyblok,
  GlobalNavStoryblok,
  MenuVariantStoryblok,
  MoticeGroupV2Storyblok,
  PageStoryblok,
  PdpWidgetsStoryblok,
  PlaDataBucketTemplateV2Storyblok,
  PlaPageStoryblok,
  SalePagesStoryblok,
  ShopTheLookDataV2Storyblok,
  VisualSalePageStoryblok,
} from '@castlery/types';
import { ISbStoriesParams, ISbStoryData, ISbStoryParams, StoryblokClient } from '@storyblok/react';
import moment from 'moment-timezone';
import { fetchKnightApi } from '../fetch';
import { isOutdated } from '../utils';
import { SbBaseService } from './sbBaseService';
import { logger } from '@castlery/observability';
import { FALLBACK_GLOBAL_NAV_DATA } from '../fallback_resource/global-nav-file';
import { FALLBACK_OUTER_MENU_DATA } from '../fallback_resource/outer-menu-file';
import { FALLBACK_NOTICE_DATA } from '../fallback_resource/notice-file';
import { FALLBACK_FOOTER_DATA } from '../fallback_resource/footer-file';
import { FALLBACK_HOME_PAGE_BRAND_REFRESH_DATA } from '../fallback_resource/home-file';

// if (typeof global.fetch !== 'undefined') {
//   const originalFetch = global.fetch;
//   global.fetch = async function (...args) {
//     console.log('[API Request]', args[0], args[1]); // 记录请求信息

//     try {
//       const response = await originalFetch.apply(this, args);
//       // 克隆响应以便可以读取 body
//       const clone = response.clone();
//       const body = await clone.json();
//       // console.log('[API Response]', body);
//       return response;
//     } catch (error) {
//       console.error('[API Error]', error);
//       throw error;
//     }
//   };
// }

export const sbContentTypes = {
  BlogPage: 'Blog Page',
  Page: 'page',
  VisualSalePage: 'Visual Sale Page',
} as const;

const HOME_PAGE_BRAND_REFRESH_SLUG = 'general-content-v2/main-pages/home-page-brand-refresh';

export class SbService extends SbBaseService {
  constructor({ client }: { client: StoryblokClient }) {
    super({ client });
  }

  private _normalizeUrl(url: string): string {
    if (!url) return '';
    let normalized = url.startsWith('/') ? url.slice(1) : url;
    normalized = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
    const questionMarkIndex = normalized.indexOf('?');
    if (questionMarkIndex !== -1) {
      normalized = normalized.substring(0, questionMarkIndex);
    }
    return normalized.toLowerCase();
  }

  private _extractStoryUrl(story: ISbStoryData): string | null {
    const path = story.path || story.slug;
    if (!path) return null;

    let url = path;
    if (story.full_slug.startsWith(this.region)) {
      if (path.startsWith(this.region)) {
        url = path.replace(this.region, '');
      }
    }
    return this._normalizeUrl(url);
  }

  /**
   * 读取内嵌的 fallback 数据
   * 当 Storyblok API 不可用时使用这些数据
   */
  private _loadFallbackNotice(): { noticeBarData: any[]; noticeBarMobileData: any[] } | null {
    try {
      const market = this.region.replace('/', '').toLowerCase() || 'sg';
      const fallbackData = FALLBACK_NOTICE_DATA[market];

      if (!fallbackData || !fallbackData.value) {
        logger.error('Fallback notice data not found', {
          market,
          availableMarkets: Object.keys(FALLBACK_NOTICE_DATA),
        });
        return null;
      }

      logger.warn('Using fallback notice data', {
        market,
        noticeBarCount: fallbackData.value.noticeBarData?.length || 0,
        noticeBarMobileCount: fallbackData.value.noticeBarMobileData?.length || 0,
        lastUpdated: fallbackData.lastUpdated,
      });

      return fallbackData.value;
    } catch (error) {
      logger.error('Failed to load fallback notice data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async getGlobalNotice(_params?: Partial<ISbStoriesParams>) {
    const slug = `${this.region}general-configuration/universal-config-new-joyboy/notice`;

    try {
      const data = await this.getStoryWithCache<MoticeGroupV2Storyblok>(slug);
      if (!data) {
        logger.error('No notice data found', { slug });

        // 尝试使用 fallback 数据
        const fallbackData = this._loadFallbackNotice();
        if (fallbackData) {
          return fallbackData;
        }

        return;
      }

      const { limit_num, notice, notice_mobile } = data.content;
      if (!notice || !limit_num || !notice_mobile) {
        logger.error('Invalid notice data structure', { slug });

        // 尝试使用 fallback 数据
        const fallbackData = this._loadFallbackNotice();
        if (fallbackData) {
          return fallbackData;
        }

        return;
      }

      return {
        noticeBarData:
          notice?.filter((item) => !isOutdated(item.published_at, item.ended_at)).slice(0, +limit_num) || [],
        noticeBarMobileData:
          notice_mobile?.filter((item) => !isOutdated(item.published_at, item.ended_at)).slice(0, +limit_num) || [],
      };
    } catch (error) {
      logger.error('Failed to fetch notice data', {
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      // API 请求失败时使用 fallback 数据
      const fallbackData = this._loadFallbackNotice();
      if (fallbackData) {
        return fallbackData;
      }

      return;
    }
  }
  /**
   * 处理并过滤 sale pages 数据
   */
  private _processSalePages(rawData: ISbStoryData<SalePagesStoryblok> | null) {
    if (!rawData) return null;

    const { seo_pages, sale_pages } = rawData.content;
    const pages = sale_pages?.concat(seo_pages || []) || [];

    // 去重并过滤过期数据
    const filterData = pages?.reduce((pre: typeof pages, item) => {
      const targetIndex = pre.findIndex((page) => page.path === item.path);
      if (targetIndex !== -1) {
        if (!isOutdated(item.published_at, item.ended_at)) {
          pre.splice(targetIndex, 1, item);
        }
      } else {
        pre.push(item);
      }
      return pre;
    }, [] as typeof pages);

    return filterData;
  }

  async getRawSalePages(params?: Partial<ISbStoriesParams>) {
    const slug = `${this.region}${CMS_PATHS.SALE_PAGES}`;

    // 第一次尝试：使用缓存调用
    // 注意：getStoryWithCache 已经有容错机制，不会缓存错误数据
    try {
      const rawData = await this.getStoryWithCache<SalePagesStoryblok>(slug, params);
      const data = this._processSalePages(rawData);
      if (data) {
        return { data, error: null };
      }
    } catch (error) {
      logger.warn('Cached sale pages fetch failed, attempting real-time retry', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 第二次尝试：不使用缓存，直接获取最新数据（容错机制）
    try {
      const rawData = await this.getStoryInRealTime<SalePagesStoryblok>(slug, params);
      const data = this._processSalePages(rawData);
      if (data) {
        return { data, error: null };
      }

      logger.error('No sale pages data found after retry', { slug });
      return {
        data: null,
        error: new Error('No sale pages data found after retry'),
      };
    } catch (retryError) {
      logger.error('Failed to fetch sale pages after retry', {
        slug,
        error: retryError instanceof Error ? retryError.message : String(retryError),
      });
      return {
        data: null,
        error: retryError as Error,
      };
    }
  }
  // TODO @Wcdaren 让业务维持一个 archived sale page 的 content 就好了
  async getSalePages(params?: Partial<ISbStoriesParams>) {
    const { data, error } = await this.getRawSalePages(params);
    if (error || !data || !data.length) {
      throw error || new Error('No sale pages data found');
    }

    const optimizedRes = data.map((item) => {
      return {
        key: item.key,
        query: item.query,
        name: item.name,
        metaTitle: item.name,
        metaDescription: '',
        url: item.path,
        _uid: item._uid,
        isSeoPage: item.is_seo_page,
        outdatedUrls: item.outdated_urls,
        query_deliver_before: item.query_deliver_before,
      };
    });
    return optimizedRes;
  }

  async getPages(params?: Omit<ISbStoriesParams, 'content_type'>) {
    // TODO 这里需要carl 确认下 这里是否需要添加路径限制
    const res = await this.getAllWithCache(
      'cdn/stories',
      {
        ...params,
        content_type: sbContentTypes.Page,
        starts_with: this.region,
      },
      {
        tags: [sbContentTypes.Page],
      }
    );
    // 这里要不要使用 timer 来过滤
    return res || [];
  }

  async getVisualSalePages(params?: Omit<ISbStoriesParams, 'content_type'>) {
    const { stories } = await this.getStoriesWithCache<VisualSalePageStoryblok>(
      {
        ...params,
        per_page: 100,
        content_type: sbContentTypes.VisualSalePage,
        starts_with: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/sale-pages/visual-sale-pages-folder/`,
      },
      {
        tags: [sbContentTypes.VisualSalePage],
      }
    );
    return stories || [];
  }

  /**
   * 装饰链接，移除 origin 和 country 前缀
   */
  private _decorateLink(link: string): string {
    const origin = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME || '';
    const country = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
    let tempLink = link;
    if (tempLink.startsWith('/')) {
      tempLink = tempLink.slice(1);
    }

    const stripPrefix = (value: string, prefix: string) => {
      if (!value.startsWith(prefix)) {
        return null;
      }
      const nextChar = value.charAt(prefix.length);
      if (nextChar && nextChar !== '/' && nextChar !== '?' && nextChar !== '#') {
        return null;
      }
      return value.slice(prefix.length);
    };

    const strippedOriginCountry = stripPrefix(tempLink, `${origin}/${country}`);
    if (strippedOriginCountry !== null) {
      return strippedOriginCountry;
    }

    const strippedCountry = stripPrefix(tempLink, country);
    if (strippedCountry !== null) {
      return strippedCountry;
    }

    return tempLink;
  }

  /**
   * 处理 global nav 数据，对每个 item 的 link.url 应用 decorateLink
   */
  private _processGlobalNavData(items: any[]): any[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => {
      if (item?.link?.url) {
        return {
          ...item,
          link: {
            ...item.link,
            url: this._decorateLink(item.link.url),
          },
        };
      }
      return item;
    });
  }

  /**
   * 读取内嵌的 fallback 数据
   * 当 Storyblok API 不可用时使用这些数据
   */
  private _loadFallbackGlobalNav(): any[] | null {
    try {
      const market = this.region.replace('/', '').toLowerCase() || 'sg';
      const fallbackData = FALLBACK_GLOBAL_NAV_DATA[market];

      if (!fallbackData || !fallbackData.value) {
        logger.error('Fallback global nav data not found', {
          market,
          availableMarkets: Object.keys(FALLBACK_GLOBAL_NAV_DATA),
        });
        return null;
      }

      logger.warn('Using fallback global nav data', {
        market,
        count: fallbackData.value.length,
        lastUpdated: fallbackData.lastUpdated,
      });

      return fallbackData.value;
    } catch (error) {
      logger.error('Failed to load fallback global nav data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * 获取 Global Nav 数据（仅 Next.js 持久缓存，不含 React cache 去重）
   * 适用于 Route Handler / API 等非 React 渲染上下文
   */
  async getGlobalNav(params?: Partial<ISbStoriesParams>) {
    return this._fetchGlobalNav(params, false);
  }

  /**
   * 获取 Global Nav 数据（React cache + Next.js 持久缓存）
   * 适用于页面渲染场景，同一渲染周期内多次调用会自动去重
   */
  async getGlobalNavWithDedup(params?: Partial<ISbStoriesParams>) {
    return this._fetchGlobalNav(params, true);
  }

  private async _fetchGlobalNav(params?: Partial<ISbStoriesParams>, withReactCache = false) {
    const slug = `${this.region}${CMS_PATHS.GLOBAL_NAV}`;

    try {
      const res = withReactCache
        ? await this.getStoryWithBothCache<GlobalNavStoryblok>(slug, params)
        : await this.getStoryWithCache<GlobalNavStoryblok>(slug, params);
      if (!res) {
        logger.error('No global nav data found', { slug });

        const fallbackData = this._loadFallbackGlobalNav();
        if (fallbackData) {
          return this._processGlobalNavData(fallbackData);
        }

        return;
      }

      const items = res?.content.items;
      return this._processGlobalNavData(items || []);
    } catch (error) {
      logger.error('Failed to fetch global nav data', {
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      const fallbackData = this._loadFallbackGlobalNav();
      if (fallbackData) {
        return this._processGlobalNavData(fallbackData);
      }

      return;
    }
  }

  /**
   * 读取内嵌的 fallback 数据
   * 当 Storyblok API 不可用时使用这些数据
   */
  private _loadFallbackOuterMenu(): any[] | null {
    try {
      const market = this.region.replace('/', '').toLowerCase() || 'sg';
      const fallbackData = FALLBACK_OUTER_MENU_DATA[market];

      if (!fallbackData || !fallbackData.value) {
        logger.error('Fallback outer menu data not found', {
          market,
          availableMarkets: Object.keys(FALLBACK_OUTER_MENU_DATA),
        });
        return null;
      }

      logger.warn('Using fallback outer menu data', {
        market,
        count: fallbackData.value.length,
        lastUpdated: fallbackData.lastUpdated,
      });

      return fallbackData.value;
    } catch (error) {
      logger.error('Failed to load fallback outer menu data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private _getHomePageBrandRefreshFullSlug(): string {
    return `${this.region}${HOME_PAGE_BRAND_REFRESH_SLUG}`;
  }

  private _isHomePageBrandRefreshSlug(fullSlug: string): boolean {
    return fullSlug === this._getHomePageBrandRefreshFullSlug();
  }

  /**
   * 读取 Home Page Brand Refresh 的 fallback 数据
   * 当 Storyblok API 不可用时使用这些数据
   */
  private _loadFallbackHomePageBrandRefresh(): ISbStoryData<PageStoryblok> | null {
    try {
      const market = this.region.replace('/', '').toLowerCase() || 'sg';
      const fallbackData = FALLBACK_HOME_PAGE_BRAND_REFRESH_DATA[market];

      if (!fallbackData || !fallbackData.value) {
        logger.error('Fallback home page brand refresh data not found', {
          market,
          availableMarkets: Object.keys(FALLBACK_HOME_PAGE_BRAND_REFRESH_DATA),
        });
        return null;
      }

      logger.warn('Using fallback home page brand refresh data', {
        market,
        lastUpdated: fallbackData.lastUpdated,
      });

      return fallbackData.value as ISbStoryData<PageStoryblok>;
    } catch (error) {
      logger.error('Failed to load fallback home page brand refresh data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async getGlobalMenuGroupMenu(params?: Partial<ISbStoriesParams>) {
    const slug = `${this.region}${CMS_PATHS.MENU.OUTER}`;

    try {
      const data = await this.getStoryWithCache<MenuVariantStoryblok>(slug, {
        ...params,
      });
      if (!data) {
        logger.error('No menu data found', { slug });

        // 尝试使用 fallback 数据
        const fallbackData = this._loadFallbackOuterMenu();
        if (fallbackData) {
          return fallbackData;
        }

        return;
      }

      const inDateRangeData = data.content.menu_component_data?.map((item) => ({
        ...item,
        blocks: item?.blocks?.filter((block) => !isOutdated(block.published_at, block.ended_at)),
      }));
      const optimizedData = inDateRangeData?.map((item) => ({
        slug: item.slug,
        blocks:
          item?.blocks?.length && item?.blocks?.length > 0
            ? item.blocks.map(({ link, title, image_url, action_text, permalink }) => ({
                link,
                title,
                image_url,
                action_text,
                permalink,
              }))
            : [],
        disable: item?.disable === true,
      }));
      return optimizedData;
    } catch (error) {
      logger.error('Failed to fetch outer menu data', {
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      // API 请求失败时使用 fallback 数据
      const fallbackData = this._loadFallbackOuterMenu();
      if (fallbackData) {
        return fallbackData;
      }

      return;
    }
  }

  async getGlobalHeader() {
    const results = await Promise.allSettled([
      fetchKnightApi({ slug: CMS_PATHS.TAXONOMIES.MENU }),
      this.getGlobalNavWithDedup(),
      this.getSalePages(),
      this.getGlobalMenuGroupMenu(),
      fetchKnightApi({ slug: CMS_PATHS.TAXONOMIES.COLLECTIONS }),
    ]);

    const [originalMenuResult, globalNavResult, currentSalePagesResult, outerMenuResult, collectionsResult] = results;

    // 对于关键数据（menu、nav），如果失败则记录错误但继续
    // 对于 salePages，失败时使用空数组降级
    if (currentSalePagesResult.status === 'rejected') {
      logger.warn('Failed to fetch sale pages in global header', {
        error: currentSalePagesResult.reason,
      });
    }

    return {
      originalMenu:
        originalMenuResult.status === 'fulfilled' ? originalMenuResult.value || { children: [] } : { children: [] },
      globalNavData: globalNavResult.status === 'fulfilled' ? globalNavResult.value || [] : [],
      currentSalePages: currentSalePagesResult.status === 'fulfilled' ? currentSalePagesResult.value || [] : [],
      outerMenuData: outerMenuResult.status === 'fulfilled' ? outerMenuResult.value || [] : [],
      collectionsData: collectionsResult.status === 'fulfilled' ? collectionsResult.value || [] : [],
    };
  }

  /**
   * 读取内嵌的 fallback 数据
   * 当 Storyblok API 不可用时使用这些数据
   */
  private _loadFallbackFooter(): {
    footerData: any[];
    socialList: any[];
    bottomList: any[];
    mobileList: any[];
    newsletterHeaderTitle?: string;
  } | null {
    try {
      const market = this.region.replace('/', '').toLowerCase() || 'sg';
      const fallbackData = FALLBACK_FOOTER_DATA[market];

      if (!fallbackData || !fallbackData.value) {
        logger.error('Fallback footer data not found', {
          market,
          availableMarkets: Object.keys(FALLBACK_FOOTER_DATA),
        });
        return null;
      }

      logger.warn('Using fallback footer data', {
        market,
        footerDataCount: fallbackData.value.footerData?.length || 0,
        socialListCount: fallbackData.value.socialList?.length || 0,
        bottomListCount: fallbackData.value.bottomList?.length || 0,
        mobileListCount: fallbackData.value.mobileList?.length || 0,
        lastUpdated: fallbackData.lastUpdated,
      });

      return fallbackData.value;
    } catch (error) {
      logger.error('Failed to load fallback footer data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async getGlobalFooter(params?: Partial<ISbStoriesParams>) {
    const slug = `${this.region}${CMS_PATHS.FOOTER}`;

    try {
      const data = await this.getStoryWithCache<FooterV2Storyblok>(slug, params);
      if (!data) {
        logger.error('No footer data found', { slug });

        // 尝试使用 fallback 数据
        const fallbackData = this._loadFallbackFooter();
        if (fallbackData) {
          return fallbackData;
        }

        return;
      }

      const { bottomList, mobileList, socialList, list, newsletterHeaderTitle } = data.content;
      return {
        footerData: list || [],
        socialList: socialList || [],
        bottomList: bottomList || [],
        mobileList: mobileList || [],
        newsletterHeaderTitle: newsletterHeaderTitle,
      };
    } catch (error) {
      logger.error('Failed to fetch footer data', {
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      // API 请求失败时使用 fallback 数据
      const fallbackData = this._loadFallbackFooter();
      if (fallbackData) {
        return fallbackData;
      }

      return;
    }
  }

  async getBlogPosts(params?: Partial<ISbStoriesParams>) {
    const { stories } = await this.getStoriesWithCache<BlogPageStoryblok>({
      starts_with: this.region + 'general-content-v2/ugc-pgc/blog/',
      content_type: sbContentTypes.BlogPage,
      page: 1,
      per_page: 9,
      ...(params || {}),
    });

    return stories.map((item) => {
      const blogBanner = item.content?.body?.find((block) => block.component === 'blog-banner') as BlogBannerStoryblok;

      return {
        key: String(item.id),
        bannerBackgroundImage: blogBanner?.image?.[0].desktop_url || '',
        name: item.name,
        url: '/' + item.slug,
        publishedAt: item.published_at === null ? '' : moment(item.published_at).format('MMM D, YYYY'),
      };
    });
  }
  async getBlogPostsOnClient(params?: Partial<ISbStoriesParams>) {
    const { stories } = await this.getStoriesWithoutCache<BlogPageStoryblok>({
      starts_with: this.region + 'general-content-v2/ugc-pgc/blog/',
      content_type: sbContentTypes.BlogPage,
      page: 1,
      per_page: 9,
      ...(params || {}),
    });
    return stories.map((item) => {
      const blogBanner = item.content?.body?.find((block) => block.component === 'blog-banner') as BlogBannerStoryblok;

      return {
        key: String(item.id),
        bannerBackgroundImage: blogBanner?.image?.[0].desktop_url || '',
        name: item.name,
        url: '/' + item.slug,
        publishedAt: item.published_at === null ? '' : moment(item.published_at).format('MMM D, YYYY'),
      };
    });
  }
  async getBlogPost(slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithCache<BlogPageStoryblok>(
      `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/ugc-pgc/blog/${slug}`,
      params,
      {
        tags: [`blog/${slug}`],
      }
    );
  }

  async getPlaLayout(variant: string, params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithCache<PlaPageStoryblok>(
      `${this.region}general-content/product-pages/pla-layout/${variant}`,
      {
        ...params,
      },
      {
        tags: [`${this.region}general-content/product-pages/pla-layout/${variant}`],
      }
    );
  }

  async getPlaDataBucket(slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithCache<PlaDataBucketTemplateV2Storyblok>(
      `${this.region}general-content/product-pages/pla-bucket/${slug}`,
      params,
      {
        tags: [`${this.region}general-content/product-pages/pla-bucket/${slug}`],
      }
    );
  }

  async getPlaDataBucketWithoutCache(slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStory<PlaDataBucketTemplateV2Storyblok>(
      `${this.region}general-content/product-pages/pla-bucket/${slug}`,
      params
    );
  }

  async getPDPDataBucketWithoutCache(params?: Partial<ISbStoryParams>) {
    let shouldContinue = true;
    let page = 1;
    const allStories: ISbStoryData<DataBucketStoryblok>[] = [];
    try {
      while (shouldContinue) {
        const { stories } = await this.getStoriesWithoutCache<DataBucketStoryblok>({
          starts_with: `${this.region}${CMS_PATHS.PDP.DATA_BUCKET}`,
          page: page,
          per_page: 100,
          ...(params || {}),
        });
        if (stories.length < 100) {
          shouldContinue = false;
        }
        allStories.push(...stories);
        page++;
      }
    } catch (error) {
      logger.error('Failed to fetch PDP data bucket', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
    return allStories;
  }

  async getWidgets(slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithBothCache<PdpWidgetsStoryblok>(`${this.region}${slug}`, params, {
      tags: [`${this.region}${slug}`],
    });
  }

  async getShopTheLook(params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithCache<ShopTheLookDataV2Storyblok>(
      `${this.region}${CMS_PATHS.SHOP_THE_LOOK}`,
      params,
      {
        tags: [CMS_PATHS.SHOP_THE_LOOK],
      }
    );
  }

  // TODO @Wcdaren 到时好好思考下 怎么处理 getAllStories 如果放成 server only
  async getRestPage(slug: string) {
    const allStories = await this.getAllFromGeneralContentV2();
    const marketPathArr = ['sg/', 'us/', 'au/', 'ca/', 'uk/'];
    const page = allStories?.find(({ slug: rawSlug, path }) => {
      if (path !== null) {
        if (marketPathArr.some((prefix) => path?.startsWith(prefix))) {
          const matchedPrefix = marketPathArr.find((prefix) => path?.startsWith(prefix));
          if (matchedPrefix) {
            const newPath = path?.slice(matchedPrefix.length);
            if (newPath === slug) {
              return true;
            }
          }
        }
      } else {
        if (rawSlug === slug) {
          return true;
        }
      }
      return false;
    });
    return page || undefined;
  }

  async getSpecificPage(full_slug: string, params?: Partial<ISbStoryParams>) {
    const story = await this.getStoryWithCache<PageStoryblok>(`${full_slug}`, params, {
      tags: [`${full_slug}`],
    });

    if (story) {
      return story;
    }

    if (this._isHomePageBrandRefreshSlug(full_slug)) {
      const fallbackData = this._loadFallbackHomePageBrandRefresh();
      if (fallbackData) {
        return fallbackData;
      }
    }

    logger.error('No specific page data found', { full_slug });
    return null;
  }

  async getSpecificPageWithoutCache(full_slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStory<PageStoryblok>(`${full_slug}`, params);
  }

  /**
   * 获取 Storyblok 故事内容（用于 composite-components）
   * 这是一个通用方法，可以获取任何 slug 的故事
   */
  async getStory(slug: string, params?: Partial<ISbStoryParams>) {
    return await this.getStoryWithCache(slug, params);
  }
}
