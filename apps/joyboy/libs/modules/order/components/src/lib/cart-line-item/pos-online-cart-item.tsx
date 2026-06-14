'use client';

import React from 'react';
import { Stack, Box, Checkbox, Typography } from '@castlery/fortress';
import { type LineItem } from '@castlery/modules-order-domain';
import { FortressImage } from '@castlery/shared-components';

interface OnlineCartItemProps {
  item: LineItem;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const OnlineCartItem: React.FC<OnlineCartItemProps> = ({ item, checked, onChange }: OnlineCartItemProps) => {
  const changeHandler = () => {
    onChange(!checked);
  };
  return (
    <Stack
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', columnGap: 2, paddingY: 2 }}
      onClick={changeHandler}
    >
      {/* TODO 到处这里 要弄成 https://mui.com/joy-ui/react-checkbox/#clickable-container  */}
      <Checkbox checked={checked} />
      <Box sx={{ width: 108, height: 108 }}>
        <FortressImage src={item?.variant?.images[0]?.links?.small} imageHeight={108} imageWidth={108} alt="product" />
      </Box>
      <Box>
        <Typography level="body1">{item.variant?.product_name}</Typography>
        {item.variant?.variant_option_values && Array.isArray(item.variant.variant_option_values) ? (
          <Typography level="body2" color="neutral">
            {item.variant?.variant_option_values.map((option: { presentation: string }, index: number) => (
              <Typography key={option.presentation}>
                {option.presentation}
                {index < item.variant?.variant_option_values.length - 1 ? (
                  <Typography sx={{ marginX: 0.5 }}>|</Typography>
                ) : null}
              </Typography>
            ))}
          </Typography>
        ) : null}

        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            columnGap: 2,
          }}
        >
          <Typography level="body2">Qty: {item.quantity}</Typography>
          <Typography>
            {item?.variant?.list_price !== item.variant?.price && (
              <Typography level="body2" sx={{ mr: 1, textDecorationLine: 'line-through' }}>
                ${item?.variant?.list_price}
              </Typography>
            )}
            <Typography level="body2" color="primary">
              ${item.variant?.price}
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

export const PosOnlineCartItem = React.memo(OnlineCartItem);
