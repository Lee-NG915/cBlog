'use server';

import {
  fetchAllStoriesByContentType,
  fetchFromKnightServer,
  fetchFromStoryblok,
  fetchFromStoryblokPage,
  getTimestamp,
  // getTimestamp,
} from '@castlery/modules-cms-services';
import { getStoryblokApi } from '@storyblok/react/rsc';
import { EcEnv } from '@castlery/config';
import { unstable_cache } from 'next/cache';
import { withServerActionInstrumentation, BUSINESS_DOMAIN, BusinessSeverity } from '@castlery/observability/server';
/**
 * todo:
 * 为什么希望将CMS的接口调用放在server action中？
 * 1.安全性考虑，为了避免在客户端暴露敏感信息
 * 2.减少客户端计算的压力，将计算放在服务端进行
 * 3.storyblok组件通常是static的，不因用户行为而改变，所以可以从API中做较长久的缓存，这个缓存不依赖于store，而是依赖于fetch 的cache,但是在server action中fetch请求不会被默认缓存，所以需要手动设置缓存
 * 4.保持数据的一致性，避免客户端和服务端的数据不一致
 * 关于处理CMS缓存的方式：
 *
 *
 */

function fetchCMSData() {
  // Functionality remains the same inside each method
  // const { slugArray, contentType } = options;
}

// Attaching methods to fetchCMSData directly
fetchCMSData.knight = function ({ slugArray }: { slugArray: string[] }) {
  return fetchFromKnightServer({ slugArray });
};

fetchCMSData.storyblok = function ({ slugArray }: { slugArray: string[] }) {
  return fetchFromStoryblok({ slugArray });
};

fetchCMSData.allStoryblokPages = function ({ contentType }: { contentType: string }) {
  return fetchAllStoriesByContentType({ contentType });
};

fetchCMSData.storyblokPage = function ({ slugArray }: { slugArray: string[] }) {
  return fetchFromStoryblokPage({ slugArray });
};

export default fetchCMSData;

export const getStoryByApi = withServerActionInstrumentation(
  async (slug: string) => {
    const isTest = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test');
    const storyblokApi = getStoryblokApi();
    const storyblokApiFetch = unstable_cache(
      async () => {
        return await storyblokApi.get(`cdn/stories/${slug}`, {
          version: isTest ? 'draft' : 'published',
          cv: getTimestamp(),
        });
      },
      [`${slug}`],
      {
        tags: [`${slug}`],
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      }
    );
    return await storyblokApiFetch();
  },
  {
    actionName: 'getStoryByApi',
    monitoringContext: {
      domain: BUSINESS_DOMAIN.CMS,
      severity: BusinessSeverity.LOW,
    },
  }
);
