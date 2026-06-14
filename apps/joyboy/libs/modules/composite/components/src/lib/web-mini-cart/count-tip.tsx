'use client';

import { Typography } from '@castlery/fortress';
import { selectCartItemsCount } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CheckCircleFilled } from '@castlery/fortress/Icons';

export const CountTip = () => {
  const count = useAppSelector(selectCartItemsCount);
  //   if (!count) return null;
  return (
    <Typography
      level="body1"
      startDecorator={<CheckCircleFilled sx={{ color: (theme) => theme.palette.brand.terracotta[500] }} />}
      sx={{ py: 6 }}
    >
      {count} {count === 1 ? 'item' : 'items'} added to your cart
    </Typography>
  );
};

export default CountTip;
