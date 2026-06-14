import { createAction } from '@reduxjs/toolkit';

/**
 * @description User completed the shipping-method step of the checkout funnel.
 * @scenario Dispatched from the UI when the shipping-method step is confirmed.
 *           Consumed by `checkout-tracking.listener` to fire GA `checkout`
 *           funnel step 4 with `option` as `actionField.option`.
 * @payload option — GA `actionField.option` value. The dispatcher resolves the
 *           market-specific source upstream:
 *             - SG:     assembly preference slug
 *             - non-SG: selected shipping service type
 */
export const checkoutShippingMethodStepCompletedEvent = createAction<{ option: string }>(
  'checkout/shippingMethodStepCompleted'
);
