'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Rating } from '@castlery/shared-components';

interface ReviewRatingProps {
  averageRating: number;
  totalCount: number;
}

const ReviewRating = (props: ReviewRatingProps) => {
  const { averageRating, totalCount } = props;
  const { desktop, mobile, tablet } = useBreakpoints();
  return (
    <Stack
      direction={'row'}
      justifyContent={desktop ? 'center' : 'flex-start'}
      alignItems={'center'}
      gap={(theme) => (desktop ? theme.spacing(6) : theme.spacing(4))}
      sx={{
        maxWidth: 300,
        ...(desktop && {
          maxWidth: 352,
        }),
      }}
    >
      <Typography
        sx={(theme) => ({
          fontSize: '72px !important',
          mr: theme.spacing(4),
          ...(mobile && {
            fontSize: '36px !important',
          }),
        })}
      >
        {averageRating}/5
      </Typography>
      <Stack gap={mobile ? 1 : 2} sx={(theme) => ({ ...(tablet && { mr: theme.spacing(5) }) })}>
        <Rating
          rating={averageRating}
          size={desktop ? 30 : 20}
          innerType="outline"
          innerColor={'#844025'}
          outerColor={'transparent'}
        />
        <Typography level="body2">
          {`Based on ${totalCount} ${totalCount > 1 ? 'reviews' : 'review'} globally`}
        </Typography>
      </Stack>
    </Stack>
  );
};

export { ReviewRating };
