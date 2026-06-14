'use client';

import { Box, Typography } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { AddOnServiceLineItemV1 } from '@castlery/types';

export function WebOrderServiceItemsMobileV1({ addServiceList }: { addServiceList: AddOnServiceLineItemV1[] }) {
  if (!addServiceList || addServiceList.length === 0) {
    return null;
  }
  return (
    <Box sx={{ px: 4, py: 6, display: 'flex', flexDirection: 'column', rowGap: 4 }}>
      {addServiceList.map((item: AddOnServiceLineItemV1) => {
        return (
          <Box key={item.id}>
            <Box>
              <Typography level="body1">{item.variant.name}</Typography>
            </Box>
            <Box>
              <Typography level="caption1">
                Price: {toPrice(+item.displayPrice, true)} | Qty: {item.quantity}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
