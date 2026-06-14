'use client';

import React from 'react';
import { Stack, Box, Checkbox, Typography } from '@castlery/fortress';
import { LineItemSchema } from '@castlery/types';
import { FortressImage } from '@castlery/shared-components';

interface OnlineCartItemProps {
  item: LineItemSchema;
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
        <FortressImage src={item?.variant?.images[0]?.links?.mini} imageHeight={108} imageWidth={108} alt="product" />
      </Box>
      <Box>
        <Typography level="body1">{item.variant?.productName}</Typography>
        {item.variant?.variantOptionValues && Array.isArray(item.variant.variantOptionValues) ? (
          <Typography level="body2" color="neutral">
            {item.variant?.variantOptionValues.map((option: { presentation: string }, index: number) => (
              <Typography key={option.presentation}>
                {option.presentation}
                {index < item.variant?.variantOptionValues.length - 1 ? (
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
            {item?.variant?.listPrice !== item.variant?.price && (
              <Typography level="body2" sx={{ mr: 1, textDecorationLine: 'line-through' }}>
                ${item?.variant?.listPrice}
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
