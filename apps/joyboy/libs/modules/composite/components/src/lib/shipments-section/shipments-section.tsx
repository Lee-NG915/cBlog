'use client';

import { Divider, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ShipmentItemLayout } from '../shipment-item-layout/shipment-item-layout';
import { ShipmentBasicInfo } from '../shipment-basic-info/shipment-basic-info';
import { ShipmentServiceInfo } from '../shipment-service-info/shipment-service-info';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectShipmentsWithLineItems } from '@castlery/modules-checkout-domain';
import { ShipmentItemsSection } from '../shipment-items-section/shipment-items-section';
import dynamic from 'next/dynamic';

const InlineEcoDeliveryTip = dynamic(
  () => import('@castlery/shared-components').then((mod) => mod.InlineEcoDeliveryTip),
  { ssr: false }
);

export const ShipmentsSection = () => {
  const { desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod',
  });
  const shipments = useAppSelector(selectShipmentsWithLineItems);

  if (!shipments || shipments.length === 0) {
    return null;
  }

  return (
    <Stack gap={1}>
      <Stack
        direction={desktop ? 'row' : 'column'}
        alignItems={desktop ? 'center' : 'flex-start'}
        justifyContent="space-between"
        gap={2}
      >
        <Typography level="h3">{t('title')}</Typography>
        <InlineEcoDeliveryTip />
      </Stack>
      {/* ===================== Shipping Methods ===================== */}
      {shipments.map((shipment, index) => (
        <>
          <ShipmentItemLayout
            key={shipment.id}
            basicInfo={<ShipmentBasicInfo shipment={shipment} sort={index + 1} />}
            productInfo={
              <ShipmentItemsSection
                shipmentLineItems={shipment.lineItems}
                itemsSubTotal={shipment.amount.itemsSubtotal}
              />
            }
            serviceInfo={<ShipmentServiceInfo shipment={shipment} />}
          />
          {index < shipments.length - 1 && <Divider />}
        </>
      ))}
    </Stack>
  );
};

export default ShipmentsSection;
