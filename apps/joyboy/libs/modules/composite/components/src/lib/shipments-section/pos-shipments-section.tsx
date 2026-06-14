'use client';

import { Divider, Stack, Typography } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ShipmentItemLayout } from '../shipment-item-layout/shipment-item-layout';
import { ShipmentItemsSection } from '../shipment-items-section/shipment-items-section';
import { ShipmentBasicInfo } from '../shipment-basic-info/shipment-basic-info';
import { ShipmentServiceInfo } from '../shipment-service-info/shipment-service-info';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectShipmentsWithLineItems } from '@castlery/modules-checkout-domain';
import { EcEnv } from '@castlery/config';

export const PosShipmentsSection = () => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod',
  });
  const shipments = useAppSelector(selectShipmentsWithLineItems);

  const isPos = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS';

  if (!shipments || shipments.length === 0) {
    return null;
  }

  return (
    <Stack gap={1}>
      {!isPos && <Typography level="h3">{t('title')}</Typography>}
      {/* ===================== ECO Delivery ===================== */}

      {/* ===================== Shipping Methods ===================== */}
      <Stack gap={4}>
        {shipments.map((shipment, index) => (
          <Stack key={shipment.id} spacing={2}>
            <ShipmentItemLayout
              key={shipment.id}
              isPos={isPos}
              productInfo={
                <ShipmentItemsSection
                  shipmentLineItems={shipment.lineItems}
                  itemsSubTotal={shipment.amount.itemsSubtotal}
                />
              }
              basicInfo={<ShipmentBasicInfo shipment={shipment} sort={index + 1} isPos={isPos} />}
              serviceInfo={<ShipmentServiceInfo shipment={shipment} isPos={isPos} />}
            />
            {/* {index < shipments.length - 1 && <Divider />} */}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default PosShipmentsSection;
