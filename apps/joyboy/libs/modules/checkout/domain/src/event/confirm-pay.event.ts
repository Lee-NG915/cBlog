import { isAnyOf } from '@reduxjs/toolkit';
import { confirmPayments, completePay, sendStripePaymentLink } from '../api/payment.api';

export const paymentCompleteEvent = confirmPayments.matchFulfilled;

export const orderProcessEndedEvent = isAnyOf(completePay.matchFulfilled, sendStripePaymentLink.matchFulfilled);
