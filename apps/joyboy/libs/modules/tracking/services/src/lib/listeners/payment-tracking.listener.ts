import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { paymentMethodClickedEvent, placeOrderClickedEvent } from '@castlery/modules-payment-domain';
import { EVENT_GA_CLICK_PAYMENT_METHOD, EVENT_GA_CLICK_PLACE_ORDER } from '../events';

export function setupPaymentTrackingListeners(startListening: AppStartListening): Unsubscribe {
  if (!accessInWeb) {
    return () => undefined;
  }

  const subscriptions = [
    startListening({
      actionCreator: paymentMethodClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_PAYMENT_METHOD({ category: payload.category, label: payload.provider }));
      },
    }),
    startListening({
      actionCreator: placeOrderClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_PLACE_ORDER({ category: payload.provider, label: payload.label }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
