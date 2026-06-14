import { createAction } from '@reduxjs/toolkit';

/**
 * @description User opened the shipping-calculator modal from the checkout order-summary surface.
 * @scenario Triggered from `CheckoutChangeZipcodeButton` or `CartCheckoutZipcodeSelector`
 *           when `inCheckout=true`.
 */
export const checkoutShippingZipcodeSelectorClickedEvent = createAction('checkout/shippingZipcodeSelectorClicked');

/**
 * @description User submitted a new zipcode inside the checkout shipping-calculator modal.
 */
export const checkoutShippingZipcodeSelectorSubmittedEvent = createAction('checkout/shippingZipcodeSelectorSubmitted');
