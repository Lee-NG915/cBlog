'use client';
import React, { useMemo, useState } from 'react';
import { Drawer } from '@castlery/fortress';
import { CarryUpServices, type AddCarryUpServiceFn } from '../carry-up-services/carry-up-services';
import { addServiceProductCommand } from '@castlery/modules-checkout-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { AddButton } from '../add-button/add-button';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';

export interface PosAddCarryUpServiceProps {
  shipmentId: number;
}

export function PosAddCarryUpService({ shipmentId }: PosAddCarryUpServiceProps) {
  const dispatch = useAppDispatch();
  const orderNumber = useAppSelector(selectCurrentOrderNumber);

  const shipments = useAppSelector((state) => state.order.order?.shipments);
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((pre) => !pre);

  const serviceProduct = useMemo(() => {
    const shipment = shipments?.find((item) => item.id === shipmentId);
    return shipment?.available_service_products?.find((item) => item.type === 'carry_up');
  }, [shipments, shipmentId]);
  const selectedService = useMemo(() => {
    const shipment = shipments?.find((item) => item.id === shipmentId);
    return shipment?.selected_service_products?.find((item) => item.type === 'carry_up');
  }, [shipmentId, shipments]);
  const keepMounted = !!selectedService;

  const addServiceProduct: AddCarryUpServiceFn = async (service) => {
    if (!orderNumber) return;
    await dispatch(
      addServiceProductCommand({
        number: orderNumber,
        shipment_id: shipmentId,
        type: 'carry_up',
        services: [
          {
            quantity: 1,
            type: 'carry_up',
            ...service,
          },
        ],
      })
    );
    toggle();
  };

  if (!serviceProduct) return null;
  return (
    <React.Fragment>
      <AddButton handler={toggle}>Carry-Up Service</AddButton>
      <Drawer title="Add Carry-up Service" open={open} onClose={toggle}>
        <CarryUpServices
          cancel={toggle}
          keepMounted={keepMounted}
          service={serviceProduct}
          confirm={addServiceProduct}
        />
      </Drawer>
    </React.Fragment>
  );
}

export default PosAddCarryUpService;
