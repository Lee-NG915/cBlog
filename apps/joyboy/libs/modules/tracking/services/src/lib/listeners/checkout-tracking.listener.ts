import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  checkoutShippingAddressStepCompletedEvent,
  checkoutShippingMethodStepCompletedEvent,
  checkoutPaymentMethodSelectedForFunnelEvent,
} from '@castlery/modules-checkout-domain';
import { EVENT_GA_CHECKOUT } from '../events';
import { getEventRandomId } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';

/**
 * @description Aggregates checkout funnel step events (step 2/4/5) and
 * forwards them to the GA `checkout` trigger. Step 1 is dispatched from
 * `tracking.listener` together with FB/Pinterest/Klaviyo entries, so it
 * intentionally lives outside this file.
 *
 * Mapping:
 *  - shippingAddressStepCompleted        → checkoutStep 2
 *  - shippingMethodStepCompleted({option}) → checkoutStep 4 (option = actionField.option)
 *  - paymentMethodSelectedForFunnel({option}) → checkoutStep 5 (option = payment method id)
 *
 * `eventId` is generated here via `getEventRandomId('checkout')`, mirroring
 * step 1's listener-side eventId convention.
 */
export function setupCheckoutTrackingListeners(startListening: AppStartListening): Unsubscribe {
  if (!accessInWeb) {
    return () => undefined;
  }

  const subscriptions = [
    startListening({
      actionCreator: checkoutShippingAddressStepCompletedEvent,
      effect: async (_, { dispatch }) => {
        const eventId = getEventRandomId(EVENTS_NAMES_MAP.GA_CHECKOUT);
        await dispatch(EVENT_GA_CHECKOUT({ checkoutStep: 2, eventId }));
      },
    }),
    startListening({
      actionCreator: checkoutShippingMethodStepCompletedEvent,
      effect: async ({ payload }, { dispatch }) => {
        const eventId = getEventRandomId(EVENTS_NAMES_MAP.GA_CHECKOUT);
        await dispatch(EVENT_GA_CHECKOUT({ checkoutStep: 4, eventId, option: payload.option }));
      },
    }),
    startListening({
      actionCreator: checkoutPaymentMethodSelectedForFunnelEvent,
      effect: async ({ payload }, { dispatch }) => {
        const eventId = getEventRandomId(EVENTS_NAMES_MAP.GA_CHECKOUT);
        await dispatch(EVENT_GA_CHECKOUT({ checkoutStep: 5, eventId, option: payload.option }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
