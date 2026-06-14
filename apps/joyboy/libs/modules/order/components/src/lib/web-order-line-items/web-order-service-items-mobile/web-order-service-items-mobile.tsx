'use client';

import { Box, Typography } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';

export function WebOrderServiceItemsMobile({ serviceItems }: { serviceItems: any }) {
  if (!serviceItems || serviceItems.length === 0) {
    return null;
  }
  return (
    <Box sx={{ px: 4, py: 6, display: 'flex', flexDirection: 'column', rowGap: 4 }}>
      {serviceItems.map((service: any) => {
        return (
          <Box key={service.id}>
            <Box>
              <Typography level="body1">{service.variant.name}</Typography>
            </Box>
            <Box>
              <Typography level="caption1">
                Price: {toPrice(+service.total / service.quantity, true)} | Qty: {service.quantity}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
