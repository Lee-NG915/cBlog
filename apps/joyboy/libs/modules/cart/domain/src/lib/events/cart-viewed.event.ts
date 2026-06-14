import { createAction } from '@reduxjs/toolkit';
import type { LineItemSchema } from '@castlery/types';

/**
 * @description Surface enum identifying which cart surface owns the view-cart
 * impression. Forwarded by `cart-tracking.listener` directly into the GA
 * `view_cart` event's `eventDetails.label`.
 */
export type CartViewedSurface = 'miniCart' | 'fullCart';

export interface CartViewedPayload {
  surface: CartViewedSurface;
  lineItems: LineItemSchema[];
}

/**
 * @description User viewed the cart. Dispatched once per mount: fullCart fires
 *              when `PageClient` first sees non-empty cart line items; miniCart
 *              fires on the drawer's first open per mount.
 */
export const cartViewedEvent = createAction<CartViewedPayload>('cart/viewed');
