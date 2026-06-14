'use client';

import { useSearchParams } from 'next/navigation';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { BlendRecommendationCarousel } from '../blend-recommendation-carousel';
import { DYRecommendationCarouselWithoutRequest } from '../recommendation-carousel';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_RECOMMENDATIONS } from '@castlery/modules-tracking-services';

interface TemplateDiversionProps {
  selector_name: string;
  onClick?: (header: string) => void;
  fallbackWidget?: React.ReactNode;
  pendingNode?: React.ReactNode;
  containerSx?: any;
  customPageAttributes?: Record<string, any>;
}
const TemplateDiversion = ({
  selector_name,
  onClick,
  fallbackWidget,
  pendingNode,
  containerSx,
  customPageAttributes,
}: TemplateDiversionProps) => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';

  const dispatch = useAppDispatch();

  const campaign = useGetDyCampaignsQuery(
    {
      campaignNames: [selector_name || ''],
      query: { dyApiPreview },
      ...(customPageAttributes && { customPageAttributes }),
    },
    { skip: !selector_name }
  );

  const customData = campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpressionRef = useRef(false);

  const trackImpression = useCallback(() => {
    if (hasTrackedImpressionRef.current) return;
    hasTrackedImpressionRef.current = true;
    dispatch(
      EVENT_RECOMMENDATIONS({
        category: 'recommendation_impression',
        action: 'impression',
        pageComponent: customData?.custom?.theme === 'flash' ? 'flash' : 'regular',
      })
    );
  }, [dispatch, customData]);

  useEffect(() => {
    const theme = customData?.custom?.theme || 'regular';
    const hasSlots = customData?.slots?.length > 0;
    if (!theme || !hasSlots) return;

    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackImpression();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [customData, trackImpression]);

  const content =
    customData?.custom?.theme === 'flash' ? (
      <BlendRecommendationCarousel
        campaign={campaign}
        selector_name={selector_name}
        onClick={onClick}
        fallbackWidget={fallbackWidget}
        containerSx={containerSx}
        customPageAttributes={customPageAttributes}
      />
    ) : (
      <DYRecommendationCarouselWithoutRequest
        campaign={campaign}
        selector_name={selector_name}
        onClick={onClick}
        fallbackWidget={fallbackWidget}
        pendingNode={pendingNode}
        containerSx={containerSx}
        customPageAttributes={customPageAttributes}
      />
    );

  return <div ref={containerRef}>{content}</div>;
};

export { TemplateDiversion };
