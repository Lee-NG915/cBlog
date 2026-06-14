import { type RecommendationContext } from './context.entity';
import { type RealtimeFilters } from './realtime-filter.entity';
import { NextRequest, NextResponse } from 'next/server';

export interface CampaignsRequestOptions {
  /** The list of selectors that are eligible for this page. A selector represents a technical name for a campaign. */
  campaignNames: string[];
  /** Call a group of selectors instead of listing each selector individually. https://dy.dev/docs/selector-groups  */
  campaignGroups?: string[];
  /**
   * The context of the page that the user is currently on.
   * This context is used to provide more relevant recommendations.
   * Optional in client-side: window.DY.recommendationContext
   * Required in SSR, but other type of context can be used
   */
  recommendationContext?: {
    type: 'HOMEPAGE' | 'CATEGORY' | 'PRODUCT' | 'CART' | 'OTHER';
    data: string[];
  };
  customPageAttributes?: Record<string, any>;
  /**
   * Filter-rules For Recommendation Result，Helpful for Recommendation type campaigns
   * @see https://dy.dev/docs/return-real-time-filter-data
   */
  realtimeFilters?: RealtimeFilters;
  locale?: string;
  query?: {
    dyApiPreview?: string;
  } | null;
  /**
   * learn more about data cache
   * https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#caching-data
   * https://nextjs.org/docs/app/building-your-application/caching#data-cache
   */
  cacheOptions?: {};
}

export type CookieContext = { cookies: Function } | { req: NextRequest; res: NextResponse };
