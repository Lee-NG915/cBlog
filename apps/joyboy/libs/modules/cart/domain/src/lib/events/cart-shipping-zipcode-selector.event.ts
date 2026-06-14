import { createAction } from '@reduxjs/toolkit';

/**
 * @description Surface enum identifying which cart-side entry opened/submitted
 * the shipping calculator. `_banner` variants flag the promotion-hint inline
 * banner entry (distinct from the cart action button entry).
 */
export type CartShippingZipcodeSelectorSource = 'Fullcart' | 'Minicart' | 'Fullcart_banner' | 'Minicart_banner';

export interface CartShippingZipcodeSelectorPayload {
  source: CartShippingZipcodeSelectorSource;
}

/**
 * @description User opened the shipping-calculator modal from a cart-side surface
 *              (full cart / mini cart, button or banner).
 */
export const cartShippingZipcodeSelectorClickedEvent = createAction<CartShippingZipcodeSelectorPayload>(
  'cart/shippingZipcodeSelectorClicked'
);

/**
 * @description User submitted a new zipcode inside the cart-side shipping-calculator modal.
 *              Source is the same enum, but `_banner` variants are not produced here
 *              (banner only owns the click surface; submission always happens from the
 *              shared modal which doesn't carry banner provenance).
 */
export const cartShippingZipcodeSelectorSubmittedEvent = createAction<CartShippingZipcodeSelectorPayload>(
  'cart/shippingZipcodeSelectorSubmitted'
);
