'use client';

import { Divider, Stack, Tag, Typography } from '@castlery/fortress';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ShipmentItemWithLineItemsSchema } from '@castlery/types';
import { LAYOUT_MODE, CartItemInfo } from '@castlery/modules-cart-components';
import { toPrice } from '@castlery/utils';

export const ShipmentItemsSection = ({
  shipmentLineItems,
  itemsSubTotal,
}: {
  shipmentLineItems: ShipmentItemWithLineItemsSchema['lineItems'];
  itemsSubTotal: string;
}) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod.shipment',
  });
  const itemsCount = useMemo(
    () => shipmentLineItems?.reduce((acc, lineItem) => acc + lineItem.quantity, 0),
    [shipmentLineItems]
  );
  const cartItemProps = useMemo(() => {
    return {
      layoutMode: LAYOUT_MODE.SHIPMENT,
      showReviews: false,
      showWarranty: false,
      showCustomized: true,
      showLeadTime: false,
      showLLTTag: false,
      showO2OTag: false,
      supportChooseWarranty: false,
      showCartActionSection: false,
    };
  }, []);
  return (
    <Stack gap={7}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Tag sx={{ textTransform: 'lowercase' }}>{t('itemsCount', { itemsCount } as any)}</Tag>
        <Divider orientation="vertical" />
        <Typography level="body2">{toPrice(Number(itemsSubTotal), true)}</Typography>
      </Stack>

      <Stack spacing={6}>
        {shipmentLineItems?.map((lineItem) => (
          <CartItemInfo key={lineItem.id} item={lineItem} {...cartItemProps} />
        ))}
      </Stack>
    </Stack>
  );
};
