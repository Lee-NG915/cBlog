'use client';
import { UIContent } from './content';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, selectTruncatedReviews } from '@castlery/modules-product-domain';
import type { ReviewsDefaultVariantV2 } from '@castlery/modules-cms-domain';
import { useEffect } from 'react';
import { getWebProductReviewsCommand } from '@castlery/modules-product-services';

export interface ReviewsProps {
  blok: ReviewsDefaultVariantV2;
}
export function Reviews({ blok }: ReviewsProps) {
  const dispatch = useAppDispatch();
  const reviewsList = useAppSelector(selectTruncatedReviews);
  const product = useAppSelector(selectProduct);

  useEffect(() => {
    dispatch(
      getWebProductReviewsCommand({
        pageNumber: 1,
        perPage: 5,
      })
    );
  }, [dispatch]);

  if (!reviewsList || reviewsList.length === 0) return null;

  return (
    <>
      <UIContent reviews={reviewsList} productSlug={product?.slug} blok={blok} />
    </>
  );
}

export default Reviews;
