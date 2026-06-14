import { type CampaignsRequestOptions, type DyCookiesCollection, DYPageTypes } from '../entity';
import { accessInServer, accessInSgAndAu, INTL_LOCALE, EcEnv } from '@castlery/config';
import { getDyCookies } from './get-dy-cookies.util';

const dyFallbackLocale = INTL_LOCALE || 'en';

export const specialCampaigns = {
  HP_Migration_Test: 'HP Migration Test',
};
/**
 * @description 生成动态数据请求的payload
 * @implements https://dy.dev/docs/selector-groups
 * @api https://dy.dev/reference/choose-variations
 * @doc https://dy.dev/docs/best-practices-for-experience-apis-implementation
 * @returns
 */
export const getDyApiPayload = (
  {
    recommendationContext,
    campaignNames,
    campaignGroups = [],
    realtimeFilters,
    customPageAttributes = {},
    locale = dyFallbackLocale,
    query = {},
  }: CampaignsRequestOptions,
  dyCookies: DyCookiesCollection
) => {
  if (accessInSgAndAu && campaignNames.length > 0 && campaignNames[0] === specialCampaigns.HP_Migration_Test) {
    return null;
  }
  const dyPageLocation = dyCookies.dyPageLocation || ''; // 获取当前页面路径
  const dyid = dyCookies.dyid || ''; // 获取当前用户的dyid
  const dyidServer = dyCookies.dyidServer || ''; // 获取当前用户的dyidServer
  const dyNewUser = dyCookies.dyNewUser || ''; // 获取当前用户是否为新用户
  const dySession = dyCookies.dySession || ''; // 获取当前用户的dySession
  const dyIp = dyCookies.dyIp || ''; // 获取当前用户的IP地址

  const previewToken = [];
  //todo:如果是客户端，需要自动获取dyApiPreview
  if (query?.dyApiPreview) {
    previewToken.push(query.dyApiPreview);
  }

  const newUser = accessInServer ? (dyid ? 'false' : 'true') : dyNewUser === 'true' ? 'true' : 'false';

  const validRealtimeFilters = realtimeFilters
    ? Object.keys(realtimeFilters)
        .filter((campaignName) => campaignNames.includes(campaignName))
        .reduce((acc, campaignName) => ({ ...acc, [campaignName]: realtimeFilters[campaignName] }), {})
    : {};

  const validPageContext = recommendationContext
    ? recommendationContext
    : typeof window !== 'undefined' && window.DY && window.DY.recommendationContext
    ? window.DY.recommendationContext
    : {
        type: DYPageTypes.OTHER,
        data: [],
      };

  const pageLocation = dyPageLocation
    ? dyPageLocation
    : typeof window !== 'undefined' && window.location
    ? EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME + window.location.pathname
    : EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME + `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`;

  const payload = {
    user: {
      dyid: dyid,
      dyid_server: dyidServer,
    },
    session: {
      dy: dySession,
    },
    context: {
      page: {
        type: validPageContext?.type,
        data: validPageContext?.data || [],
        location: `${pageLocation}`, //获取当前页面路径
        locale: locale,
      },
      pageAttributes: {
        newUser,
        ...customPageAttributes,
      },
      device: {
        ip: dyIp,
      },
    },
    selector: {
      names: campaignNames,
      groups: campaignGroups,
      preview: {
        ids: previewToken,
      },
      args: validRealtimeFilters,
    },
    options: {
      isImplicitPageview: false,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  return payload;
};

export const DY_ENGAGEMENT_TYPE = {
  API_CUSTOM_CODE: 'api_custom_code',
  API_RECOMMENDATIONS: 'api_recommendations',
} as const;

export const getDefaultDyEngagementPayload = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const dyCookies = getDyCookies();
  return {
    user: {
      dyid: dyCookies.dyid,
      dyid_server: dyCookies.dyidServer,
      // active_consent_accepted:false,// todo: 需要在consent优化后开启这个属性
    },
    session: {
      dy: dyCookies.dySession,
    },
    context: {
      // optional 属性
      device: {
        ip: dyCookies.dyIp,
      },
      channel: 'WEB',
    },
  };
};

/**
 * @description 生成ApiCustomCode Campaign Engagement的payload
 * @implements https://dy.dev/reference/track-engagement
 * @param engagementType: 'IMP' | 'CLICK';
 * @param decisionId: string ,The unique Decision ID as returned from the /choose endpoint.
 * @param variations?: number[] , The unique Variation ID as returned from the /choose endpoint.
 * @returns payload of ApiCustomCode Campaign Engagement
 */
export const getDyApiCustomCodeCampaignEngagementPayload = ({
  engagementType,
  decisionId,
  variations,
}: {
  engagementType: 'IMP' | 'CLICK';
  decisionId: string /** The unique Decision ID as returned from the /choose endpoint. */;
  variations?: number[] /** The unique Variation ID as returned from the /choose endpoint. */;
}) => {
  if (typeof window === 'undefined') {
    return null;
  }
  const defaultPayload = getDefaultDyEngagementPayload();
  return {
    ...defaultPayload,
    engagements: [
      {
        type: engagementType,
        decisionId,
        variations: variations || [],
      },
    ],
  };
};

/**
 * @description 生成ApiRecommendations Campaign Engagement的payload
 * @implements https://dy.dev/reference/track-engagement
 * @param slotId: string , Use to report a click on an API recommendation or a search result. Pass the Slot ID for the clicked product as returned in the /choose response.
 * @returns payload of ApiRecommendations Campaign Engagement
 */
export const getDyApiRecommendationsCampaignEngagementPayload = ({
  slotId,
}: {
  slotId: string /** Use to report a click on an API recommendation or a search result. Pass the Slot ID for the clicked product as returned in the /choose response.  */;
}) => {
  if (typeof window === 'undefined') {
    return null;
  }
  const defaultPayload = getDefaultDyEngagementPayload();
  return {
    ...defaultPayload,
    engagements: [
      {
        type: 'SLOT_CLICK',
        slotId,
      },
    ],
  };
};
