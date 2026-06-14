import type { RealtimeFilters } from '../entity';
import { accessInServer, INTL_LOCALE } from '@castlery/config';
import { getDyApiHeader, getDyApiUrl, getDyCookies, getDyApiPayload } from '../utils';
import { dyGlobalControlCheck } from './gcg-check.server.api';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@castlery/observability/server';

/**
 * @description Fetch DY Campaigns Data (Server-side)
 * @example
 * ```ts
 * import { dyCampaignsFetcher } from '@castlery/modules-dy-domain';
 * import { cookies } from 'next/headers';
 *
 * export async function MyServerComponent() {
 *    const cookieContext = { cookies: cookies };
 *    const res = await dyCampaignsFetcher(parameters, cookieContext);
 *    if (!res.ok) {
 *      throw new Error('Failed to fetch DY campaigns');
 *    }
 *    const campaignData = await res.json();
 *    return (
 *      <div>
 *          <div>{campaignData.choices[0].name}</div>
 *      </div>
 *    )
 * }
 * ```
 * @implements https://dy.dev/docs/selector-groups
 * @api https://dy.dev/reference/choose-variations
 * @doc https://dy.dev/docs/best-practices-for-experience-apis-implementation
 */
export const dyCampaignsFetcher = async (
  parameters: {
    recommendationContext: {
      type: 'HOMEPAGE' | 'CATEGORY' | 'PRODUCT' | 'CART' | 'OTHER';
      data: string[];
    };
    campaignNames: string[];
    campaignGroups?: string[];
    realtimeFilters?: RealtimeFilters;
    customPageAttributes?: Record<string, any>;
    locale?: string;
    query?: {
      dyApiPreview?: string;
    };
  },
  cookieContext: { cookies: Function } | { req: NextRequest; res: NextResponse }
) => {
  const {
    recommendationContext,
    campaignNames,
    campaignGroups,
    realtimeFilters,
    customPageAttributes,
    locale = INTL_LOCALE,
    query,
  } = parameters;
  if (accessInServer && !cookieContext) {
    throw new Error(
      '~file: campaigns.server.api.ts:59 ~ dyCampaignsFetcher ~ cookieContext is required in server-side'
    );
  }
  const dyCookies = getDyCookies(cookieContext);
  let globalControlTestGroup = 'undefined';
  try {
    globalControlTestGroup = await dyGlobalControlCheck(cookieContext);
  } catch (e) {
    // Since `globalControlTestGroup` is optional, it will not affect subsequent requests even if it fails
    logger.info('Failed to check DY global control group', { error: e });
  }
  const payload = getDyApiPayload(
    {
      recommendationContext,
      campaignNames,
      campaignGroups,
      realtimeFilters,
      customPageAttributes: { ...customPageAttributes, globalControlTestGroup },
      locale,
      query,
    },
    dyCookies
  );
  if (!payload) {
    logger.error('DY campaign payload is empty', { campaignNames, campaignGroups });
    return Promise.resolve({});
  }
  const url = getDyApiUrl();
  const header = getDyApiHeader();
  /**
   * Data Fetching, Caching, and Revalidating
   * https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
   */
  return await fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(payload),
  });
};
