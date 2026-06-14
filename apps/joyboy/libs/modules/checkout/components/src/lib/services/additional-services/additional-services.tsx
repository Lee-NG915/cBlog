import { memo, useMemo } from 'react';
import { Box, Divider, Stack, Typography } from '@castlery/fortress';
import { type AdditionalShippingService } from '@castlery/modules-checkout-domain';
import { toPrice } from '@castlery/utils';
import type { Order } from '@castlery/types';
import { PosAddShipmentService } from '../pos-add-shipment-service/pos-add-shipment-service';
export interface AdditionalServicesProps {
  additionalService: AdditionalShippingService | null;
  shipment: Order['shipments'][0];
}
export const AdditionalServices = memo(({ additionalService, shipment }: AdditionalServicesProps) => {
  const { selected_service_type } = shipment;

  const selectedService =
    additionalService?.available_service_types?.find((service) => service.type === selected_service_type?.type) || null;

  const serviceFee = useMemo(() => {
    const idBasicService = selectedService && ['standard_service', 'standard'].includes(selectedService.type);
    const prefix = idBasicService ? '' : '+';
    const fee = shipment.waive_service_fee
      ? 0
      : idBasicService
      ? Number(shipment?.basic_shipping_fee)
      : Number(shipment?.service_fee);
    return `${prefix}${toPrice(fee)}`;
  }, [shipment, selectedService]);

  if (!selected_service_type || Object.keys(selected_service_type).length === 0) return null;

  const displayName =
    selectedService?.display_name ||
    (typeof selectedService?.type === 'string' && selectedService?.type?.replaceAll('_', ' '));

  const showChooseBtn =
    additionalService?.available_service_types && additionalService.available_service_types.length > 1;

  const showSection = selectedService || showChooseBtn;

  if (!showSection) return null;

  return (
    <>
      <Divider />
      <Stack spacing={1}>
        <Typography level="subh2">Additional Services</Typography>
        {selectedService ? (
          <Box
            sx={{
              display: 'flex',
              flexFlow: 'row wrap',
              alignItems: 'center',
              paddingY: 0.5,
              paddingX: { xs: 1, sm: 2 },
              columnGap: 4,
            }}
          >
            <Typography>{displayName}</Typography>
            <Typography>
              {serviceFee}
              {/* {showPlus ? '+' : ''}
              {waive_service_fee ? '$0' : toPrice(Number(shipment?.service_fee))} */}
            </Typography>
          </Box>
        ) : null}
      </Stack>
      {showChooseBtn && (
        <PosAddShipmentService
          defaultType={selectedService?.type || ''}
          data={additionalService}
          basicShippingFee={shipment.basic_shipping_fee}
        ></PosAddShipmentService>
      )}
    </>
  );
});

export default AdditionalServices;
