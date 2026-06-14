'use client';

import { Box, Typography } from '@castlery/fortress';
import { useMemo } from 'react';
import type { LineItem, AddonServiceLineItem } from '@castlery/types';

export interface PosItemDeliveryTipProps {
  item: Partial<LineItem & AddonServiceLineItem>;
}

export function PosItemDeliveryTip({ item }: PosItemDeliveryTipProps) {
  const {
    product_type,
    preferred_stock_location,
    preferred_self_collection,
    delivery_lead_time_presentation,
    lead_time_presentation,
    warehouse_name,
  } = item || {};
  const isServiceItem = useMemo(() => product_type && ['service'].includes(product_type), [product_type]);

  return (
    <>
      {!isServiceItem && (
        <Box
          sx={{
            mt: 0.5,
            '&>span': {
              color: (theme) => theme.palette.brand.charcoal[500],
            },
          }}
        >
          <Typography sx={{ fontSize: 8 }}>
            From {preferred_stock_location?.name || `Warehouse ${warehouse_name ? ` - ${warehouse_name}` : ''}`}
          </Typography>
          <Typography level="caption1">
            {preferred_self_collection ? (
              <>Cash & Carry</>
            ) : delivery_lead_time_presentation ? (
              <>Estimated Delivery: {delivery_lead_time_presentation}</>
            ) : (
              <>Dispatch {lead_time_presentation}</>
            )}
          </Typography>
        </Box>
      )}
    </>
  );
}

export default PosItemDeliveryTip;
