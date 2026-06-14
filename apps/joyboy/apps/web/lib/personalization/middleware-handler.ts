import { NextRequest, NextResponse } from 'next/server';
import { personalizationRoutes } from './configuration';
import { dyCampaignsFetcher } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from '@castlery/modules-dy-services';
import { logger } from '@castlery/observability/server';

export const isPersonalizationRoute = (pathname: string) => {
  // TODO: Implement personalization route check
  return personalizationRoutes.some((route) => pathname.includes(route.path) || pathname.startsWith(`${route.path}/`));
};

// TODO: Implement personalization middleware handler
export const personalizationMiddlewareHandler = async (request: NextRequest) => {
  const route = personalizationRoutes.find((route) => request.nextUrl.pathname.includes(route.path));

  if (route) {
    const { campaignSelectorName, pageContextHandler } = route;
    const pageContext = pageContextHandler(request);

    try {
      const res = await dyCampaignsFetcher(
        {
          campaignNames: [campaignSelectorName],
          // @ts-ignore
          recommendationContext: pageContext,
        },
        { req: request, res: NextResponse.next() }
      );
      if (!res.ok) {
        logger.error('Failed to fetch DY campaign in personalization middleware', {
          status: res.status,
          campaignName: campaignSelectorName,
          pathname: request.nextUrl.pathname,
        });
        return Promise.resolve(null);
      }
      if (res.ok) {
        const data = await res.json();
        const detail = formatCampaignsResponse(data.choices);
        const slug = detail[campaignSelectorName].hitVariation.slug;
        return Promise.resolve({ slug, cookies: data.cookies });
      }
    } catch (err) {
      logger.error('Error in personalization middleware handler', {
        error: err,
        campaignName: campaignSelectorName,
        pathname: request.nextUrl.pathname,
      });
    }
  }
  return Promise.resolve(null);
};
