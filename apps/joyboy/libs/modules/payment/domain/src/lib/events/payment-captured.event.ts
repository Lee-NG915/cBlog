import { createAction } from '@reduxjs/toolkit';

export type WebPaymentCapturedEventPayload = {
  value: string;
};

export const webPaymentCapturedEvent = createAction<WebPaymentCapturedEventPayload>('payment/webPaymentCaptured');
