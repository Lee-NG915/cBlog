import { dyApi, dyCollectApi } from '@castlery/shared-redux-services';
import type { CampaignsRequestOptions } from '../entity';
import {
  getDyApiPayload,
  getDyApiHeader,
  getDyCookies,
  getDyApiRecommendationsCampaignEngagementPayload,
  getDyApiCustomCodeCampaignEngagementPayload,
} from '../utils';

/**
 * DY Choose API - 获取 campaigns/recommendations
 * 使用 dyApi (https://direct.dy-api.com/v2/)
 *
 * @see https://dy.dev/docs/campaigns
 * @see https://dy.dev/reference/choose-variations
 */
export const dyRecommendationsApi = dyApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getDyCampaigns: builder.query<any, CampaignsRequestOptions>({
        query: (payload) => ({
          url: `serve/user/choose`,
          method: 'POST',
          headers: getDyApiHeader(),
          body: getDyApiPayload(payload, getDyCookies()),
        }),
      }),
    };
  },
});

/**
 * DY Collect API - Engagement 上报
 * 使用 dyCollectApi (https://direct-collect.dy-api.com/v2/)
 *
 * @see https://dy.dev/docs/engagement
 * @see https://dy.dev/reference/track-engagement
 *
 * ## Engagement 类型
 * - SLOT_CLICK: Recommendations/Sorting Optimizer 产品点击，需要 slotId
 * - CLICK: Custom API campaigns 变体点击，需要 decisionId
 * - IMP: 曝光上报 (仅当 isImplicitImpressionMode=false)
 *
 * ⚠️ 必须使用 dyCollectApi，不能用 dyApi！
 *    错误的域名会导致请求静默失败，DY 看板无数据。
 */
export const dyCollectApiEndpoints = dyCollectApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      reportDyApiRecommendationsEngagement: builder.mutation<any, { slotId: string }>({
        query: ({ slotId }: { slotId: string }) => ({
          url: `collect/user/engagement`,
          method: 'POST',
          headers: getDyApiHeader(),
          body: getDyApiRecommendationsCampaignEngagementPayload({ slotId }),
        }),
      }),
      reportDyApiCustomCodeCampaignEngagement: builder.mutation<
        any,
        { engagementType: 'IMP' | 'CLICK'; decisionId: string; variations?: number[] }
      >({
        query: ({
          engagementType,
          decisionId,
          variations,
        }: {
          engagementType: 'IMP' | 'CLICK';
          decisionId: string;
          variations?: number[];
        }) => ({
          url: `collect/user/engagement`,
          method: 'POST',
          headers: getDyApiHeader(),
          body: getDyApiCustomCodeCampaignEngagementPayload({ engagementType, decisionId, variations }),
        }),
      }),
    };
  },
});

export const { useGetDyCampaignsQuery, useLazyGetDyCampaignsQuery } = dyRecommendationsApi;

export const { useReportDyApiRecommendationsEngagementMutation, useReportDyApiCustomCodeCampaignEngagementMutation } =
  dyCollectApiEndpoints;

export const { getDyCampaigns } = dyRecommendationsApi.endpoints;
export const { reportDyApiRecommendationsEngagement, reportDyApiCustomCodeCampaignEngagement } =
  dyCollectApiEndpoints.endpoints;
