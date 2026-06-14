import { createApi, retry } from '@reduxjs/toolkit/query/react';
import { tagTypes } from './tag-types';
import { sharedBaseQueryWithReAuth } from './shared-base-query-with-re-auth';
import { EcEnv, X_ACCESS_TOKEN } from '@castlery/config';
import { needAuthenticated } from './shared-prepare-headers';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { logger } from '@castlery/observability';
import { X_CHANNEL } from '@castlery/config';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DY_CLIENT_BASE_URL } from '@castlery/config';
const baseQueryWithRetry = retry(sharedBaseQueryWithReAuth, { maxRetries: 3 });

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded
 */
export const api = createApi({
  /**
   * `reducerPath` is optional and will not be required by most users.
   * This is useful if you have multiple API definitions,
   * e.g. where each has a different domain, with no interaction between endpoints.
   * Otherwise, a single API definition should be used in order to support tag invalidation,
   * among other features
   */
  reducerPath: 'castlery',
  /**
   * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
   */
  baseQuery: baseQueryWithRetry,
  /**
   * Tag types must be defined in the original API definition
   * for any tags that would be provided by injected endpoints
   */
  tagTypes: Object.values(tagTypes),
  /**
   * This api has endpoints injected in adjacent files,
   * which is why no endpoints are shown below.
   * If you want all endpoints defined in the same file, they could be included here instead
   */
  endpoints: () => ({}),
});
/**
 * search
 */
// export const searchApi = createApi({
//   /**
//    * `reducerPath` is optional and will not be required by most users.
//    * This is useful if you have multiple API definitions,
//    * e.g. where each has a different domain, with no interaction between endpoints.
//    * Otherwise, a single API definition should be used in order to support tag invalidation,
//    * among other features
//    */
//   reducerPath: 'search-castlery',
//   baseQuery: fetchBaseQuery({
//     baseUrl:
//       // EcEnv.NEXT_PUBLIC_CHANNEL === 'POS'
//       //   ? EcEnv.NEXT_PUBLIC_API_HOST.replace('//api', '//search')
//       //   : EcEnv.NEXT_PUBLIC_API_HOST,
//       EcEnv.NEXT_PUBLIC_API_HOST,
//     // eslint-disable-next-line
//     prepareHeaders: (headers, { extra, endpoint }) => {
//       // By default, if we have a token in the store, let's use that for authenticated requests
//       if (!headers.has(X_ACCESS_TOKEN) && needAuthenticated()) {
//         try {
//           const { persistenceHandles } = extra as ExtraArgument;
//           const token = persistenceHandles?.accessToken?.getItem();
//           if (token) {
//             headers.set(X_ACCESS_TOKEN, `${token}`);
//           }
//         } catch (error) {
//           logger.error('Failed to set access token in DY request header', { error });
//         }
//       }

//       if (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS') {
//         try {
//           if (!headers.has(X_CHANNEL)) {
//             headers.set(X_CHANNEL, EcEnv.NEXT_PUBLIC_CHANNEL.toLocaleLowerCase());
//           }
//         } catch (error) {
//           logger.error('Failed to set channel in DY request header', { error });
//         }
//       }

//       return headers;
//     },
//   }),
//   /**
//    * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
//    */
//   // baseQuery: baseQueryWithReAuth,
//   /**
//    * Tag types must be defined in the original API definition
//    * for any tags that would be provided by injected endpoints
//    */
//   // tagTypes: Object.values(tagTypes),
//   /**
//    * This api has endpoints injected in adjacent files,
//    * which is why no endpoints are shown below.
//    * If you want all endpoints defined in the same file, they could be included here instead
//    */
//   endpoints: () => ({}),
// });

// export const yotpoBaseApi = createApi({
//   reducerPath: 'yotpo-api',
//   baseQuery: fetchBaseQuery({ baseUrl: 'https://loyalty.yotpo.com/api/' }),
//   endpoints: () => ({}),
// });

// export const enhancedApi = api.enhanceEndpoints({
//   endpoints: () => ({
//     getPost: () => 'test',
//   }),
// });

/**
 * ============================================================================
 * DY (Dynamic Yield) Experience API 配置
 * ============================================================================
 *
 * @see https://dy.dev/docs/experience-api-basics
 * @see https://dy.dev/docs/engagement
 *
 * DY 使用不同的域名区分 API 类型，这是官方设计，不能混用！
 *
 * ## Client-side API 域名 (US Data Center)
 *
 * | API 类型     | Base URL                              | 用途                    |
 * |-------------|---------------------------------------|------------------------|
 * | Choose API  | https://direct.dy-api.com/v2/         | 获取 campaigns/推荐     |
 * | Collect API | https://direct-collect.dy-api.com/v2/ | 上报 engagement/events |
 *
 * ## Collect API 端点
 * - /collect/user/engagement - 上报用户交互 (CLICK, SLOT_CLICK, IMP 等)
 * - /collect/user/event - 上报业务事件 (Add to Cart, Purchase 等)
 *
 * ## Engagement 类型说明 (来自官方文档)
 * - SLOT_CLICK: 用于 Recommendations/Sorting Optimizer，上报具体点击的产品 (需要 slotId)
 * - CLICK: 用于 Custom API campaigns，上报变体点击 (需要 decisionId)
 * - IMP: 上报曝光 (仅当 isImplicitImpressionMode=false 时需要)
 *
 * ⚠️ 重要：如果把 Collect API 请求发到 direct.dy-api.com，请求会静默失败，DY 看板不会有数据！
 */

/**
 * DY Choose API - 用于获取 campaigns/recommendations
 * Base URL: https://direct.dy-api.com/v2/
 * @see https://dy.dev/reference/choose-variations
 */
// export const dyApi = createApi({
//   reducerPath: 'dy-api',
//   baseQuery: fetchBaseQuery({
//     baseUrl: DY_CLIENT_BASE_URL, // https://direct.dy-api.com/v2/
//   }),
//   endpoints: () => ({}),
// });

/**
 * DY Collect API - 用于上报 engagement 和 events
 * Base URL: https://direct-collect.dy-api.com/v2/
 *
 * 完整端点示例:
 * - https://direct-collect.dy-api.com/v2/collect/user/engagement
 * - https://direct-collect.dy-api.com/v2/collect/user/event
 *
 * @see https://dy.dev/reference/track-engagement
 * @see https://dy.dev/docs/engagement
 */
export const dyCollectApi = createApi({
  reducerPath: 'dy-collect-api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://direct-collect.dy-api.com/v2/',
  }),
  endpoints: () => ({}),
});

// export const storyblokApi = createApi({
//   reducerPath: 'storyblok-api',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://api.storyblok.com/v2/cdn/stories/',
//   }),
//   endpoints: () => ({}),
// });
