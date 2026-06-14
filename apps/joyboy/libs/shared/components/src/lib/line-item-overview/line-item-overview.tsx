'use client';

import { Box, Stack, Typography } from '@castlery/fortress';
import { FortressImage } from '../fortress-image/fortress-image';
import { LineItemSchema } from '@castlery/types';
import { removeClPicBgColor } from '@castlery/utils';
import { LineItemNameWithLink } from '../line-item-name-with-link/line-item-name-with-link';

export interface LineItemOverviewProps {
  lineItem: LineItemSchema;
}

export function LineItemOverview({ lineItem }: LineItemOverviewProps) {
  const { variant, quantity } = lineItem;
  const variantOptionValues = variant?.variantOptionValues || [];
  const image = variant?.images[0]?.links.mini ? removeClPicBgColor(variant?.images[0]?.links.mini) : '';
  const title = variant?.productName;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        columnGap: 4,
      }}
    >
      <Box sx={{ width: 160 }}>
        <Box sx={{ width: 142, mx: 'auto' }}>
          <FortressImage src={image} alt={title} imageWidth={142} imageHeight={95} ratio={142 / 95} objectFit="cover" />
        </Box>
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <LineItemNameWithLink item={lineItem} />
        {variantOptionValues.map((optionValue) => (
          <Typography key={optionValue.name} level="caption1">
            {optionValue.presentation}
          </Typography>
        ))}

        <Typography level="caption2" sx={{ mt: 2 }}>
          Quantity: {quantity}
        </Typography>
      </Stack>
    </Box>
  );
}

export default LineItemOverview;
