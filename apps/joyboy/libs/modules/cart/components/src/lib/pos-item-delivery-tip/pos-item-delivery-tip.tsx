'use client';
import { Box, Typography } from '@castlery/fortress';
import { useMemo } from 'react';
import type { LineItemSchema, AddOnServiceLineItemSchema } from '@castlery/types';
import { getDeliveryTimePresentation } from '@castlery/utils';

export interface PosItemDeliveryTipProps {
  item: LineItemSchema | AddOnServiceLineItemSchema;
}

export function PosItemDeliveryTip({ item }: PosItemDeliveryTipProps) {
  const { productType } = item || {};

  const { preferredSelfCollection, leadTimeInfo, preferredStockLocationId } = item as LineItemSchema;
  const isServiceItem = useMemo(() => productType && ['service'].includes(productType), [productType]);

  const deliveryLeadTimePresentation = useMemo(() => {
    return getDeliveryTimePresentation({
      startDeliveryTime: leadTimeInfo?.startDeliveryTime,
      endDeliveryTime: leadTimeInfo?.endDeliveryTime,
      startDispatchTime: leadTimeInfo?.startDispatchTime,
      endDispatchTime: leadTimeInfo?.endDispatchTime,
      showPrefix: false,
    });
  }, [leadTimeInfo]);

  return (
    <>
      {!isServiceItem && (
        <Box
          sx={{
            // mt: 0.5,
            '&>span': {
              color: 'var(--fortress-palette-brand-mono-500)',
            },
          }}
        >
          {preferredSelfCollection ? (
            <Typography level="caption2">Cash & Carry | From {preferredStockLocationId}</Typography>
          ) : (
            <Typography level="caption2">
              {preferredStockLocationId || 'Warehouse'} Delivery: {deliveryLeadTimePresentation}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
}

export default PosItemDeliveryTip;
