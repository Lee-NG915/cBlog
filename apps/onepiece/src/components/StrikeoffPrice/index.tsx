import React from 'react';
import { Stack, Typography } from '@castlery/fortress';
import { StrikeoffPriceProps } from './Props';

const StrikeoffPrice: React.FC<StrikeoffPriceProps> = ({
  price = 0,
  strikeoffPrice = 0,
  showStrikeoffPrice = false,
  containerProps,
  priceProps,
  strikeoffPriceProps,
}) => (
  <Stack direction="row" spacing={1} {...containerProps}>
    <Typography {...priceProps} sx={{ color: '#3C101E' }}>
      {price}
    </Typography>
    {showStrikeoffPrice && (
      <Typography
        sx={{
          textDecoration: 'line-through !important',
          color: '#9E9E9E',
        }}
        {...strikeoffPriceProps}
      >
        {strikeoffPrice}
      </Typography>
    )}
  </Stack>
);

export default StrikeoffPrice;
export { calcItemStrikeThroughPrice } from 'utils/price';
