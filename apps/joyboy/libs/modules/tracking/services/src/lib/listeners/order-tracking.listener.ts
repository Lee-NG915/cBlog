import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  orderHistoryAtcClickedEvent,
  orderHistoryCancelOrderClickedEvent,
  orderHistoryPayClickedEvent,
  orderCanceledViewedEvent,
  orderPendingPaymentViewedEvent,
  orderTrackingLinkClickedEvent,
} from '@castlery/modules-order-domain';
import {
  EVENT_GA_CLICK_ATC,
  EVENT_GA_CLICK_CANCEL_ORDER,
  EVENT_GA_CLICK_PAY_ORDER_HISTORY,
  EVENT_GA_VIEW_CANCELED_ORDER,
  EVENT_GA_VIEW_PENDING_PAYMENT_ORDER,
  EVENT_GA_ORDER_TRACKING_LINK_CLICK,
} from '../events';

export function setupOrderTrackingListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: orderHistoryAtcClickedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_ATC());
      },
    }),
    startListening({
      actionCreator: orderHistoryPayClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_PAY_ORDER_HISTORY({ remainingTime: payload.remainingTime }));
      },
    }),
    startListening({
      actionCreator: orderHistoryCancelOrderClickedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_CANCEL_ORDER());
      },
    }),
    // Web-only: POS sales-order-details renders the same `WebOrderInfoOverviewV1`
    // and would otherwise dispatch on mount — silently skip it here.
    startListening({
      actionCreator: orderCanceledViewedEvent,
      effect: async (_, { dispatch }) => {
        if (!accessInWeb) return;
        await dispatch(EVENT_GA_VIEW_CANCELED_ORDER());
      },
    }),
    startListening({
      actionCreator: orderPendingPaymentViewedEvent,
      effect: async (_, { dispatch }) => {
        if (!accessInWeb) return;
        await dispatch(EVENT_GA_VIEW_PENDING_PAYMENT_ORDER());
      },
    }),
    startListening({
      actionCreator: orderTrackingLinkClickedEvent,
      effect: async (_, { dispatch }) => {
        if (!accessInWeb) return;
        await dispatch(EVENT_GA_ORDER_TRACKING_LINK_CLICK());
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
