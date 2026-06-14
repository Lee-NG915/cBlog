import { createAction } from '@reduxjs/toolkit';

/**
 * @description User selected a payment method during the checkout funnel.
 *              Distinct from the payment-domain `paymentMethodClickedEvent`
 *              (which drives the `click_payment_method` GA event) — this one
 *              feeds the GA `checkout` funnel step 5 specifically.
 * @scenario Dispatched from the UI when a payment method is committed for the
 *           checkout funnel. Consumed by `checkout-tracking.listener` to fire
 *           GA `checkout` funnel step 5 with `option` as `actionField.option`.
 * @payload option — payment method id, mapped verbatim to `actionField.option`.
 */
export const checkoutPaymentMethodSelectedForFunnelEvent = createAction<{ option: string }>(
  'checkout/paymentMethodSelectedForFunnel'
);
