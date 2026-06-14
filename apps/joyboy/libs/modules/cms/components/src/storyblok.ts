import { EcEnv } from '@castlery/config';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { components } from './lib';
import type { StoryblokClient, ISbStoriesParams } from '@storyblok/react';
import { SbService } from '@castlery/modules-cms-services';
import { BUSINESS_DOMAIN, wrapClient, BusinessPriority } from '@castlery/observability/server';

export const getStoryblokApi = storyblokInit({
  accessToken: EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components,
  bridge: true,
  apiOptions: {},
}) as () => StoryblokClient;

// 原始的 SbService 实例
const originalSbApiClient = new SbService({
  client: getStoryblokApi(),
});

// ✅ 包装后导出：自动追踪所有 get* 方法
export const sbApiClient = wrapClient(
  originalSbApiClient,
  [
    'getGlobalNotice',
    'getSalePages',
    'getRawSalePages',
    'getPages',
    'getVisualSalePages',
    'getGlobalNav',
    'getGlobalMenuGroupMenu',
    'getGlobalHeader',
    'getGlobalFooter',
    'getBlogPosts',
    'getBlogPostsOnClient',
    'getBlogPost',
    'getPlaLayout',
    'getPlaDataBucket',
    'getPlaDataBucketWithoutCache',
    'getPDPDataBucketWithoutCache',
    'getWidgets',
    'getShopTheLook',
    'getRestPage',
    'getSpecificPage',
    'getSpecificPageWithoutCache',
  ],
  {
    context: {
      domain: BUSINESS_DOMAIN.CMS,
      priority: BusinessPriority.MEDIUM,
    },
    getSpanName: (methodName, args) => {
      const firstArg = args[0];
      const slug = typeof firstArg === 'string' && firstArg ? `:${firstArg}` : '';
      return `storyblok.${methodName}${slug}`;
    },
  }
);

export type { StoryblokClient, ISbStoriesParams };
