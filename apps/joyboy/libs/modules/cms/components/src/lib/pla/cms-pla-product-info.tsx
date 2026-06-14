'use client';

import { useAppSelector } from '@castlery/shared-redux-store';
import ProductInfo, { ProductInfoProps } from '../product-info/product-info';
import { selectTruncatedReviews } from '@castlery/modules-product-domain';
import { selectPlaPageStoryblok } from '@castlery/modules-cms-domain';
import { useMemo } from 'react';

export const CmsPlaProductInfo = ({ blok }: ProductInfoProps) => {
  // pla 业务逻辑
  const reviews = useAppSelector(selectTruncatedReviews);
  const plaPageStoryblok = useAppSelector(selectPlaPageStoryblok);
  const reviewsAnchorId = useMemo(() => {
    const reviewsStory = plaPageStoryblok?.body?.find((item: { component: string }) => item.component === 'reviews_v2');
    return reviewsStory?.anchor?.[0]?.anchor_id;
  }, [plaPageStoryblok?.body]);
  const overrideBlok = useMemo(() => {
    if (reviews?.length > 0 && reviewsAnchorId) {
      return {
        ...blok,
        reviewsAnchorId,
      };
    }
    return blok;
  }, [blok, reviews?.length, reviewsAnchorId]);
  return <ProductInfo blok={overrideBlok} />;
};
