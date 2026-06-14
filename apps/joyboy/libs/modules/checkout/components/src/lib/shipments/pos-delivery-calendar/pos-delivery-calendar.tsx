'use client';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { changeDeliveryDateCommand } from '@castlery/modules-checkout-services';
import { selectCurrentOrderNumber, selectOrderShipments } from '@castlery/modules-order-domain';
import { isValidDate, getRangeDays, isWeekend, addSomeDays, toGetZonedTime } from '@castlery/utils';
import { DeliveryCalendar } from '../delivery-calendar/delivery-calendar';

const daysBetweenStartToEnd = (start: string, end: string) => {
  const diff = getRangeDays(start, end);
  if (diff > 0) {
    return diff;
  }
  return 0;
};

const calculateBufferDaysExcludingWeekends = (start: string, end: string) => {
  const startDate = toGetZonedTime(start);
  const endDate = toGetZonedTime(end);
  const bufferDays = getRangeDays(endDate, startDate) + 1;

  let weekendDays = 0;
  let currentDate = startDate;

  for (let i = 0; i < bufferDays; i++) {
    if (isWeekend(currentDate)) {
      weekendDays++;
    }
    currentDate = addSomeDays(currentDate, 1);
  }

  console.log('------step1 buffer days', bufferDays - weekendDays);
  return bufferDays - weekendDays;
};

export interface PosDeliveryCalendarProps {
  shipmentId: number;
  sort: number;
  basedState: string;
}
export const PosDeliveryCalendar = ({ sort, shipmentId, basedState }: PosDeliveryCalendarProps) => {
  const dispatch = useAppDispatch();
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const shipments = useAppSelector(selectOrderShipments);
  const shipment = useMemo(() => shipments?.find((s) => s.id === shipmentId), [shipments, shipmentId]);

  const start = useMemo(() => shipment?.estimated_delivery_date_start || shipment?.estimated_dispatch_date, [shipment]);
  if (!start || !isValidDate(start)) {
    return null;
  }
  // const startDate = getDate(start).toISOString();
  const min = shipment?.min_delivery_date || shipment?.min_dispatch_date || '';
  const max = shipment?.max_delivery_date || shipment?.max_dispatch_date || '';
  // const minDate = min ? getDate(min).toDate() : null;

  const confirm = async (date: string) => {
    if (!orderNumber) {
      return Promise.reject();
    }
    await dispatch(changeDeliveryDateCommand({ number: orderNumber, shipmentId, deliveryDate: date }));
  };

  return (
    <DeliveryCalendar
      sort={sort}
      start={start}
      min={min}
      max={max}
      // startDate={startDate}
      // minDate={minDate}
      confirm={confirm}
      bufferDays={calculateBufferDaysExcludingWeekends(
        shipment?.estimated_delivery_date_start || '',
        shipment?.estimated_delivery_date_end || ''
      )}
      leastBufferDays={daysBetweenStartToEnd(
        shipment?.estimated_delivery_date_start || '',
        shipment?.estimated_delivery_date_end || ''
      )}
      basedState={basedState}
    />
  );
};
