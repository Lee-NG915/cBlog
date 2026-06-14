import { createAction } from '@reduxjs/toolkit';

/**
 * @description Surface enum identifying which cart surface owns the refresh
 * button click. Forwarded by `cart-tracking.listener` directly into the GA
 * `refresh_cart` event's `eventDetails.label`.
 */
export type CartRefreshButtonSurface = 'miniCart' | 'fullCart';

export interface CartRefreshButtonClickedPayload {
  surface: CartRefreshButtonSurface;
}

/**
 * @description User clicked the cart refresh button. Fires on every click
 *              without waiting for the refresh-cart API to settle.
 */
export const cartRefreshButtonClickedEvent = createAction<CartRefreshButtonClickedPayload>('cart/refreshButtonClicked');
