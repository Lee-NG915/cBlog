'use client';

import { Box, Typography, Divider, useBreakpoints, Stack } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProductLineItemInfoV1 } from '@castlery/shared-components';
import { OrderShipmentStateV1 } from '../order-shipment-state/order-shipment-state-v1';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { OrderShipmentV1, OrderDataV1, OrderLineItemV1 } from '@castlery/types';

interface WebOrderItemMobileV1Props {
  order: OrderDataV1;
}

export function WebOrderItemsMobileV1({ order }: WebOrderItemMobileV1Props) {
  const { tablet } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderItemTable.tableHeader',
  });

  return (
    <Box>
      {Array.isArray(order.shipments) &&
        order.shipments.map((shipment: OrderShipmentV1) => {
          return (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  pt: 6,
                  px: tablet ? 6 : 4,
                }}
              >
                {Array.isArray(shipment.lineItems) &&
                  shipment.lineItems.map((item: OrderLineItemV1) => {
                    return <ProductLineItemInfoV1 item={item} />;
                  })}
                <Box sx={{ py: 4 }}>
                  <Typography level="subh2" sx={{ textTransform: 'uppercase', mb: 2 }}>
                    {t('shipping')}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <OrderShipmentStateV1 shipment={shipment} orderNumber={order.number} />
                  </Stack>
                </Box>
              </Box>
              <Divider />
            </>
          );
        })}
    </Box>
  );
}
