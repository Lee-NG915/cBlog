import { createAction } from '@reduxjs/toolkit';

/**
 * @description User completed the shipping-address step of the checkout funnel.
 * @scenario Dispatched from the UI when the address step is confirmed (e.g.
 *           after `validateCheckoutAddress` succeeds and the funnel advances).
 *           Consumed by `checkout-tracking.listener` to fire GA `checkout`
 *           funnel step 2. UI dispatch point is wired by the feature owner.
 */
export const checkoutShippingAddressStepCompletedEvent = createAction('checkout/shippingAddressStepCompleted');
