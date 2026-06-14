'use client';

import { Box, Typography, Divider, useBreakpoints, Stack } from '@castlery/fortress';
import { selectModifiedOrderItems } from '@castlery/modules-order-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { ProductLineItemInfo } from '@castlery/shared-components';
import { OrderShipmentState } from '../order-shipment-state/order-shipment-state';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

export const webOrderItemsMobileClassNames = {
  listItemWrapper: 'web-order-items-mobile-list-item-wrapper',
};
interface WebOrderItemMobileProps {
  orderId: string;
  orderNumber: string;
}

export function WebOrderItemsMobile({ orderId, orderNumber }: WebOrderItemMobileProps) {
  const modifiedOrderShipments = useAppSelector((state) => selectModifiedOrderItems(state, orderId));
  const { tablet } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderItemTable.tableHeader',
  });

  return (
    <Box>
      {modifiedOrderShipments.map((shipment: any) => {
        return (
          <>
            <Box
              className={webOrderItemsMobileClassNames.listItemWrapper}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                pt: 6,
                px: tablet ? 6 : 4,
              }}
            >
              {shipment.line_items.map((item: any) => {
                return <ProductLineItemInfo item={item} />;
              })}
              <Box sx={{ py: 4 }}>
                <Typography level="subh2" sx={{ textTransform: 'uppercase', mb: 2 }}>
                  {t('shipping')}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <OrderShipmentState shipment={shipment} orderNumber={orderNumber} />
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
