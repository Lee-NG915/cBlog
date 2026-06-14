'use client';
import { useMemo } from 'react';
import { Stack, Typography } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PreferredDeliveryDate } from '@castlery/modules-checkout-components';
import { getDeliveryTimePresentation } from '@castlery/utils';
import { accessInSG } from '@castlery/config';
import { ShipmentItemWithLineItemsSchema } from '@castlery/types';
import { ChevronRight } from '@castlery/fortress/Icons';

interface ShipmentBasicInfoProps {
  shipment: ShipmentItemWithLineItemsSchema;
  sort: number;
  isPos?: boolean;
}

export const ShipmentBasicInfo = ({ shipment, sort, isPos = false }: ShipmentBasicInfoProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod.shipment',
  });
  const deliveryPeriod = shipment.deliveryPeriod;
  const deliveryDatePresentation = useMemo(() => {
    return getDeliveryTimePresentation({
      startDeliveryTime: deliveryPeriod.estimatedDeliveryStartDate,
      endDeliveryTime: deliveryPeriod.estimatedDeliveryEndDate,
      showPrefix: false,
    });
  }, [deliveryPeriod]);
  const showPreferredDeliveryPeriodTip = useMemo(() => {
    return deliveryPeriod.supportLaterDelivery && accessInSG;
  }, [deliveryPeriod.supportLaterDelivery]);

  return (
    <Stack
      direction={isPos ? 'row' : 'column'}
      alignItems={isPos ? 'center' : 'flex-start'}
      justifyContent={isPos ? 'space-between' : 'flex-start'}
      sx={{ py: !isPos ? 6 : 0, width: '100%' }}
      gap={isPos ? 1 : 0}
    >
      <Typography
        level={isPos ? 'h5' : 'subh1'}
        sx={
          isPos
            ? { color: 'var(--fortress-palette-neutral-500)', textWrap: 'nowrap' }
            : { color: 'var(--fortress-palette-brand-terracotta-500)' }
        }
      >{`Shipment ${sort}`}</Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={'flex-start'}
        flexWrap={'wrap'}
        columnGap={2}
        sx={{ mt: 3 }}
      >
        {/* Estimated Delivery */}
        <Typography level="caption1">
          {t('estimatedDelivery')}
          <b>{deliveryDatePresentation}</b>
          {shipment.warehouseDisplayName &&
            ` (${t('warehouseName', { warehouseName: shipment.warehouseDisplayName })})`}
        </Typography>

        {/* Request for Preferred Delivery Period */}
        {deliveryPeriod.supportLaterDelivery && (
          <PreferredDeliveryDate
            buttonText={isPos ? 'Change dates' : t('requestForPreferredDeliveryPeriod')}
            endDecorator={isPos ? <ChevronRight /> : null}
          />
        )}
      </Stack>
      {/*  just for SG,  需要增加限制 */}
      {showPreferredDeliveryPeriodTip && (
        <Typography level="caption2" sx={{ color: (theme) => theme.palette.brand.mono[700], mt: 1 }}>
          {t('subjectToAvailability')}
        </Typography>
      )}
    </Stack>
  );
};

export default ShipmentBasicInfo;
