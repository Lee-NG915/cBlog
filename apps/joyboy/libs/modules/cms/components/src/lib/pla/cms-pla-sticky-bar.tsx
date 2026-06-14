'use client';

import { selectPlaPageStoryblok } from '@castlery/modules-cms-domain';
import { selectTruncatedReviews } from '@castlery/modules-product-domain';
import { serviceGuaranteeAnchor } from '@castlery/modules-product-services';
import { useAppSelector } from '@castlery/shared-redux-store';
import { BarItemV2Storyblok, StickyBarV2Storyblok } from '@castlery/types';
import { useMemo } from 'react';
import { StickyBar } from '../sticky-bar';

export const CmsPlaStickyBar = ({ blok }: { blok: StickyBarV2Storyblok }) => {
  const reviews = useAppSelector(selectTruncatedReviews);
  const plaPageStoryblok = useAppSelector(selectPlaPageStoryblok);
  const reviewsStory = plaPageStoryblok?.body?.find((item: { component: string }) => item.component === 'reviews_v2');
  const reviewsAnchorId = reviewsStory?.anchor?.[0]?.anchor_id;
  const overrideBlok = useMemo(() => {
    if (reviews?.length <= 0) {
      const bars = blok?.bar_items?.reduce<BarItemV2Storyblok[]>((acc, item) => {
        if (item?.anchor_id === reviewsAnchorId) {
          return [
            ...acc,
            {
              ...item,
              anchor_id: serviceGuaranteeAnchor.anchor_id,
              title: serviceGuaranteeAnchor.title,
            },
          ];
        }
        return [...acc, item];
      }, []);
      return {
        ...blok,
        bar_items: bars,
      };
    }
    return blok;
  }, [blok, reviews?.length, reviewsAnchorId]);

  return <StickyBar blok={overrideBlok} />;
};
