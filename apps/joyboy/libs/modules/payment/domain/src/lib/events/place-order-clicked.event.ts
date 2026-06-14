import { createAction } from '@reduxjs/toolkit';

export type PlaceOrderClickedLabel = 'checkout_place_order' | 'checkout_retry_payment' | 'order_retry_payment';

export type PlaceOrderClickedEventPayload = {
  /** Payment method provider, e.g. `'stripe-online'`. */
  provider: string;
  /** Checkout surface / retry context. */
  label: PlaceOrderClickedLabel;
};

export const placeOrderClickedEvent = createAction<PlaceOrderClickedEventPayload>('payment/placeOrderClicked');
