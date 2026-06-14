'use client';

import { NiceModal, Stack, useBreakpoints } from '@castlery/fortress';
import { ShippingServicesDetails } from './shipping-services-details';
import { DeliveryServiceTypeEnum, DeliveryServiceItemSchema } from '@castlery/types';

interface ShippingServicesPopupProps {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  shipmentId: string;
  shippingServices: Record<DeliveryServiceTypeEnum, DeliveryServiceItemSchema>;
  waiveServiceFee: boolean;
}

export const ShippingServicesPopup = ({
  openModal,
  setOpenModal,
  shipmentId,
  shippingServices,
  waiveServiceFee,
}: ShippingServicesPopupProps) => {
  const { mobile, desktop } = useBreakpoints();
  return (
    <NiceModal
      open={openModal}
      showDefaultFooter={false}
      keepMounted={false}
      onClose={() => {
        setOpenModal(false);
      }}
      dialogSx={{
        width: desktop ? 1008 : '80%',
        minHeight: 402,
        overflowY: 'auto',
        background: 'var(--fortress-palette-brand-warmLinen-200)',
      }}
    >
      <Stack>
        <ShippingServicesDetails
          shipmentId={shipmentId}
          shippingServices={shippingServices}
          onSelected={() => {
            setOpenModal(false);
          }}
          onCancel={() => {
            setOpenModal(false);
          }}
          waiveServiceFee={waiveServiceFee}
        />
      </Stack>
    </NiceModal>
  );
};

export default ShippingServicesPopup;
