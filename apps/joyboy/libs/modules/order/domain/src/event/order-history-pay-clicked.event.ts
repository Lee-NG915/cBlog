import { createAction } from '@reduxjs/toolkit';

export type OrderHistoryPayClickedPayload = {
  /** Remaining payment countdown when the user clicked Pay, forwarded as GA `tag_value`. */
  remainingTime: string;
};

export const orderHistoryPayClickedEvent = createAction<OrderHistoryPayClickedPayload>('order/orderHistoryPayClicked');
