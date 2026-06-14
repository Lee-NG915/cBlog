/**
 * Order cookie helpers.
 *
 * `order_id` + `order_token` are paired: they identify a guest's spree order.
 * They must be cleared/rotated together to avoid leaving the browser in a
 * half-valid state. Centralising the pair here prevents callers from
 * forgetting one side and prevents drift in cookie names/paths.
 */

import * as Cookie from './Cookie';

/** Drop both order cookies. Called when the order is no longer usable for this user. */
export function clearOrderCookies(): void {
  Cookie.remove('order_id');
  Cookie.remove('order_token');
}

/**
 * Replace the current order cookies with a freshly-minted order id (e.g. after
 * a successful merge into a logged-in user's order). The guest order_token is
 * dropped because the new order is keyed by the user's access token.
 */
export function replaceOrderCookies(newOrderId: string): void {
  clearOrderCookies();
  Cookie.set('order_id', newOrderId);
}
