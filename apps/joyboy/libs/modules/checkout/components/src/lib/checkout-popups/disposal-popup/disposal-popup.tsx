'use client';
import { NiceModal } from '@castlery/fortress';
import { DisposalServiceDetails } from './disposal-service-details';
import { DeliveryServiceTypeEnum, DeliveryServiceItemSchema } from '@castlery/types';
interface DisposalPopupProps {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  shipmentId: string;
  disposalService: DeliveryServiceItemSchema;
}

export function DisposalPopup({ shipmentId, openModal = false, setOpenModal, disposalService }: DisposalPopupProps) {
  if (disposalService.serviceType !== DeliveryServiceTypeEnum.DISPOSAL_SERVICE) {
    return null;
  }

  return (
    <NiceModal
      open={openModal}
      showDefaultFooter={false}
      keepMounted={false}
      onClose={() => {
        setOpenModal(false);
      }}
      border={false}
    >
      <DisposalServiceDetails
        shipmentId={shipmentId}
        disposalService={disposalService}
        onConfirm={() => {
          setOpenModal(false);
        }}
      />
    </NiceModal>
  );
}

export default DisposalPopup;
