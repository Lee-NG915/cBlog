import { createAction } from '@reduxjs/toolkit';

export type PaymentMethodClickCategory = 'pay' | 'repay';

export type PaymentMethodClickedEventPayload = {
  provider: string;
  category: PaymentMethodClickCategory;
};

export const paymentMethodClickedEvent = createAction<PaymentMethodClickedEventPayload>('payment/paymentMethodClicked');
