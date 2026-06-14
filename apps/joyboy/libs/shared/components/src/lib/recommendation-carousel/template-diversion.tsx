'use client';

import { useSearchParams } from 'next/navigation';
import { useBreakpoints } from '@castlery/fortress';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { BlendRecommendationCarousel } from '../blend-recommendation-carousel';
import { DYRecommendationCarousel } from './dy-product-list';

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
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();

  const campaign = useGetDyCampaignsQuery(
    {
      campaignNames: [selector_name || ''],
      query: { dyApiPreview },
      ...(customPageAttributes && { customPageAttributes }),
    },
    { skip: !selector_name }
  );

  switch (campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.theme) {
    case 'flash':
      return <BlendRecommendationCarousel />;
    default:
      return (
        <DYRecommendationCarousel
          campaign={campaign}
          selector_name={selector_name}
          onClick={onClick}
          fallbackWidget={fallbackWidget}
          pendingNode={pendingNode}
          containerSx={containerSx}
          customPageAttributes={customPageAttributes}
        />
      );
  }
};
