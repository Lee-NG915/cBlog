'use client';
import { useEffect, useRef } from 'react';
import { purchasedSucceededEvent } from '@castlery/modules-order-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { OrderDataV1 } from '@castlery/types';

type UsePurchaseTrackingArgs = {
  order: OrderDataV1 | undefined;
  isOrderLoading: boolean;
  isCompletedPayment: boolean;
};

/**
 * Fires the `purchasedSucceededEvent` exactly once per resolved completed
 * order. Re-renders caused by URL or query state changes will not retrigger it.
 */
export const usePurchaseTracking = ({ order, isOrderLoading, isCompletedPayment }: UsePurchaseTrackingArgs): void => {
  const dispatch = useAppDispatch();
  const trackedOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOrderLoading || !isCompletedPayment || !order?.id) return;
    if (trackedOrderIdRef.current === order.id) return;

    trackedOrderIdRef.current = order.id;
    dispatch(purchasedSucceededEvent({ order }));
  }, [dispatch, isCompletedPayment, isOrderLoading, order]);
};
