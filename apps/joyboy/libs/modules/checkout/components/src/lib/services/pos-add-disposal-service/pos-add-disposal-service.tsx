'use client';
import React, { useCallback, useMemo, useState, memo } from 'react';
import { Drawer } from '@castlery/fortress';
import { addServiceProductCommand } from '@castlery/modules-checkout-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { AddButton } from '../add-button/add-button';
import { DisposalServices } from '../disposal-services/disposal-services';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';

export interface PosAddDisposalServiceProps {
  shipmentId: number;
}
export const PosAddDisposalService = memo(({ shipmentId }: PosAddDisposalServiceProps) => {
  const dispatch = useAppDispatch();
  const orderNumber = useAppSelector(selectCurrentOrderNumber);

  const shipments = useAppSelector((state) => state.order.order?.shipments);
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((pre) => !pre);

  const serviceProduct = useMemo(() => {
    const shipment = shipments?.find((item) => item.id === shipmentId);
    return shipment?.available_service_products?.find((item) => item.type === 'disposal');
  }, [shipments, shipmentId]);

  const selectedService = useMemo(() => {
    const shipment = shipments?.find((item) => item.id === shipmentId);
    return shipment?.selected_service_products?.find((item) => item.type === 'disposal');
  }, [shipmentId, shipments]);

  const addDisposalService = useCallback(
    async (services: { sku: string; quantity: number; type: string; name: string; price: string; size: string }[]) => {
      if (!orderNumber) return;
      await dispatch(
        addServiceProductCommand({ number: orderNumber, shipment_id: shipmentId, services: services, type: 'disposal' })
      );
      toggle();
    },
    [dispatch, shipmentId, orderNumber]
  );
  const keepMounted = !!selectedService;

  if (!serviceProduct) return null;
  return (
    <React.Fragment>
      <AddButton handler={toggle}>Disposal Service</AddButton>
      <Drawer open={open} onClose={toggle} title="Add Disposal Service">
        <DisposalServices
          keepMounted={keepMounted}
          cancel={toggle}
          serviceProduct={serviceProduct}
          confirm={addDisposalService}
        />
      </Drawer>
    </React.Fragment>
  );
});

export default PosAddDisposalService;
