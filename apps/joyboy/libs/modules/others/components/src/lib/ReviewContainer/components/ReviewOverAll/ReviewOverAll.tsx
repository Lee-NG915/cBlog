'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Rating } from '@castlery/shared-components';

type ReviewOverAllProps = {
  rating: number;
  reviewNum: number;
};

const ReviewOverAll = ({ rating, reviewNum }: ReviewOverAllProps) => {
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: {
          xs: theme.spacing(6),
          md: theme.spacing(15),
        },
        mb: {
          xs: theme.spacing(6),
          md: theme.spacing(10),
        },
      })}
    >
      <Stack
        sx={(theme) => ({
          width: 'fit-content',
          mb: {
            xs: theme.spacing(2),
            md: theme.spacing(4),
          },
        })}
      >
        <Rating rating={rating} margin={desktop ? 4 : 0} size={32} innerColor={'#844025'} outerColor={'#CCCCCC'} />
      </Stack>
      <Typography level="h3">{`${rating} | ${reviewNum} reviews`}</Typography>
    </Stack>
  );
};

export { ReviewOverAll };
