import * as React from 'react';
import { Box, Stack, Typography } from 'fortress';
import Verified from 'fortress/GlobalReview/icon/Verifyed';
import RateBar from '../RateBar/RateBar';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';
import { type ReviewInfoProps } from 'fortress/GlobalReview/types/types';

const ReviewInfo = ({ customerName, rateNum, location, reviewStatus }: ReviewInfoProps) => {
  const { mobile } = useBreakpoints();
  return (
    <Box
      sx={() => ({
        marginRight: !mobile ? 3 : 'none',
        minWidth: !mobile ? '15rem' : '',
      })}
    >
      <Box
        sx={() => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        })}
      >
        <Typography
          sx={(theme) => ({
            color: theme.palette.brand.charcoal[900],
            fontSize: '1rem',
            marginRight: 1,
          })}
        >
          {customerName}
        </Typography>
        <Verified />
      </Box>
      <Box
        sx={() => ({
          marginBottom: 2,
        })}
      >
        <RateBar num={rateNum} />
      </Box>
      {!mobile && (
        <>
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.charcoal[600],
              fontSize: '0.75rem',
            })}
          >
            {location}
          </Typography>
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.charcoal[600],
              fontSize: '0.75rem',
            })}
          >
            {reviewStatus}
          </Typography>
        </>
      )}
    </Box>
  );
};

export { ReviewInfo, ReviewInfoProps };
