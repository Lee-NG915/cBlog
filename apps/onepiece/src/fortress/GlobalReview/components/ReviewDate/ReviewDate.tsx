import * as React from 'react';
import { Stack, Typography } from 'fortress';
import { formatDate } from 'utils/time';

type ReviewDateProps = {
  date: string;
  location?: string;
};

const ReviewDate = ({ date, location }: ReviewDateProps) => {
  return (
    <Stack
      sx={() => ({
        display: 'flex',
        whiteSpace: 'nowrap',
      })}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: '#606060',
        }}
      >
        {formatDate(date)}
      </Typography>
      <Typography>{location}</Typography>
    </Stack>
  );
};

export default ReviewDate;
