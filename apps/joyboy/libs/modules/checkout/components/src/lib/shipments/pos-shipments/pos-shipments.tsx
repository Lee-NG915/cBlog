'use client';
import { useCallback, useMemo } from 'react';
import { Box } from '@castlery/fortress';
import { PosShipmentItem } from '../pos-shipment-item/pos-shipment-item';
import { DeliveryServices } from '../../services/delivery-services/delivery-services';
import { AdditionalServices } from '../../services/additional-services/additional-services';
import {
  selectDeliveryLoading,
  getShipmentOptions,
  getAvailableShipmentServices,
} from '@castlery/modules-checkout-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { addServiceProductCommand } from '@castlery/modules-checkout-services';
import { LoadingHolder } from './loading-holder';
import { selectOrder, selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { ShippingPreference } from '../shipping-preference/shipping-preference';
import { ecPosFeatures } from '@castlery/config';
import { Order } from '@castlery/types';

export function PosShipments() {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);
  const deliveryLoading = useAppSelector(selectDeliveryLoading);
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const getDeliveryOptions = useMemo(() => getShipmentOptions.select({ number: orderNumber as string }), [orderNumber]);
  const { data: shipmentOptions = null } = useAppSelector(getDeliveryOptions);

  const getServices = useMemo(() => getAvailableShipmentServices.select(orderNumber as string), [orderNumber]);
  const { data: availableServices } = useAppSelector(getServices);

  const itemGetter = useCallback((id: number) => order?.line_items?.find((i) => i.id === id) || null, [order]);
  const removeHandler = async (shipmentId: number, type: 'disposal' | 'carry_up') => {
    if (!order?.number) {
      return Promise.resolve();
    }
    await dispatch(addServiceProductCommand({ number: order?.number, shipment_id: shipmentId, type, services: [] }));
  };
  const additionalServiceGetter = (id: number) => availableServices?.find((item) => item.shipment_id === id) || null;

  const canChangeDate = useCallback(
    (shipment: Order['shipments'][0]) => {
      if (!ecPosFeatures.enabledChangeDeliveryDate) return false;
      const { id, manifest } = shipment;
      let isFromShowroom = false;
      manifest.forEach((item) => {
        const itemDetails = itemGetter(item);
        if (itemDetails?.preferred_stock_location && itemDetails?.preferred_self_collection) {
          isFromShowroom = true;
        }
      });
      if (isFromShowroom) return false;
      const targetShipment = shipmentOptions?.shipments?.find((option: any) => option.shipment_id === id);
      return targetShipment?.support_late_delivery || false;
    },
    [shipmentOptions, itemGetter]
  );

  if (!(order?.shipments && order.shipments.length > 0)) return null;

  return (
    <>
      <ShippingPreference deliveryOption={shipmentOptions?.delivery_option || null} />
      {order?.shipments.map((shipment, index) => {
        return (
          <Box key={shipment.id} sx={{ width: 'inherit', height: '100%', position: 'relative' }}>
            {deliveryLoading && (
              <LoadingHolder
                sx={{
                  width: 36,
                  height: 36,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  zIndex: 10,
                }}
              />
            )}
            <PosShipmentItem
              sort={index + 1}
              isMultiple={order.shipments.length > 1}
              disabled={deliveryLoading}
              shipment={shipment}
              itemGetter={itemGetter}
              showDateBtn={canChangeDate(shipment)}
              basedState={order.country_state}
              AdditionalServices={
                <AdditionalServices additionalService={additionalServiceGetter(shipment.id)} shipment={shipment} />
              }
              DeliveryServices={
                <DeliveryServices
                  deliveryServices={shipment.available_service_products}
                  selectedServices={shipment.selected_service_products}
                  removeHandler={(type: 'disposal' | 'carry_up') => removeHandler(shipment.id, type)}
                />
              }
            />
          </Box>
        );
      })}
    </>
  );
}

export default PosShipments;
