'use client';

import { Stack, useBreakpoints } from '@castlery/fortress';
import { GlobalReview } from '@castlery/modules-product-domain';
import { ProductReviewsItem } from '../product-reviews-items/product-reviews-item';

const ReviewList = ({ reviews }: { reviews: GlobalReview[] }) => {
  const { desktop } = useBreakpoints();
  if (desktop) {
    return (
      <Stack
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          gap: theme.spacing(6),
        })}
      >
        <Stack
          gap={6}
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {reviews.map((review, index) => {
            if (index % 2 === 0) {
              return <ProductReviewsItem key={review.id} review={review} />;
            }
            return null;
          })}
        </Stack>
        <Stack
          gap={6}
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {reviews.map((review, index) => {
            if (index % 2 === 1) {
              return <ProductReviewsItem key={review.id} review={review} />;
            }
            return null;
          })}
        </Stack>
      </Stack>
    );
  }
  return (
    <Stack gap={4}>
      {reviews.map((review) => (
        <ProductReviewsItem key={review.id} review={review} />
      ))}
    </Stack>
  );
};

export { ReviewList };
