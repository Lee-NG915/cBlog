'use client';
import { Link } from '@castlery/fortress';
import { Rating } from '@castlery/shared-components';
import { getVariantReviewSummaryService } from '@castlery/modules-product-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useState } from 'react';

type ReviewSummary = {
  average_rating: number;
  total_count: number;
  reviews: Array<{ rating: number; review_count: number }>;
};

export interface ProductReviewSummaryProps {
  sku: string;
  href?: string;
}

export const ProductReviewSummary = ({ sku, href }: ProductReviewSummaryProps) => {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(0);
  const [number, setNumber] = useState(0);
  useEffect(() => {
    const func = async () => {
      //getVariantReviewSummaryService有校验缓存，不会每次都调用API
      const res = await dispatch(getVariantReviewSummaryService(sku));
      if (res.payload) {
        const payload = res.payload as ReviewSummary;
        setRating(payload.average_rating);
        setNumber(payload.total_count);
      }
    };
    func();
  }, [dispatch, sku]);

  if (!rating || !number) {
    return null;
  }
  return (
    <Link
      level="caption1"
      variant="primary"
      href={href ? `${href}#reviews-container` : ''}
      sx={{ display: 'flex', alignItems: 'center', columnGap: 2, height: 28 }}
    >
      <Rating rating={rating} size={19} innerColor={'#844025'} outerColor="#9E9E9E" />
      {number}
    </Link>
  );
};
export default ProductReviewSummary;
