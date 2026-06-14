'use client';

import { NiceModal, useNiceModal } from '@castlery/fortress';
import { CarryUpServiceDetails } from './carry-up-service-details';
import { DeliveryServiceItemSchema } from '@castlery/types';
interface CarryUpPopupProps {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  shipmentId: string;
  carryUpService: DeliveryServiceItemSchema;
}
export const CarryUpPopup = ({ openModal, setOpenModal, shipmentId, carryUpService }: CarryUpPopupProps) => {
  const [modal, modalContextPlaceholder] = useNiceModal();

  const onConfirm = (error?: string) => {
    setOpenModal(false);
    if (error) {
      modal.warning({
        title: 'Oops!',
        desc: error,
        confirmText: 'Got it',
        showCancelBtn: false,
      });
    }
  };

  return (
    <>
      <NiceModal
        open={openModal}
        showDefaultFooter={false}
        keepMounted={false}
        onClose={() => {
          setOpenModal(false);
        }}
        border={false}
      >
        <CarryUpServiceDetails shipmentId={shipmentId} carryUpService={carryUpService} onConfirm={onConfirm} />
      </NiceModal>
      {modalContextPlaceholder}
    </>
  );
};
