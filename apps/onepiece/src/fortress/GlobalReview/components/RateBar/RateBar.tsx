import * as React from 'react';
import { Stack } from 'fortress';
import Rate from 'fortress/GlobalReview/icon/Rate';
import EmptyRate from 'fortress/GlobalReview/icon/EmptyRate';

type RateBarProps = {
  num?: number;
};

const RateBar = ({ num }: RateBarProps) => {
  if (!num || num <= 0) {
    return null;
  }
  num = Math.min(5, num);
  const rateComponents = Array.from({ length: num }, (value, index) => <Rate key={index} />);
  const emptyRateComponents = Array.from({ length: Math.ceil(5 - num) }, (value, index) => <EmptyRate key={index} />);
  return (
    <Stack
      sx={() => ({
        display: 'flex',
        flexDirection: 'row',
      })}
    >
      {rateComponents}
      {emptyRateComponents}
    </Stack>
  );
};

export default RateBar;
