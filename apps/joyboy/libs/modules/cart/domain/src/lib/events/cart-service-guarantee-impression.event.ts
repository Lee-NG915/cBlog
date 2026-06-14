import { createAction } from '@reduxjs/toolkit';

/**
 * @description Surface enum identifying which cart surface hosts the
 * service-guarantee section. Forwarded by `cart-tracking.listener` directly
 * into the GA `view_service_guarantee` event's `eventDetails.position`.
 *
 * - `miniCart` reserved for future mini-cart integration (no UI entry today)
 * - `fullCart` full cart page service-guarantee section
 */
export type CartServiceGuaranteePosition = 'miniCart' | 'fullCart';

export interface CartServiceGuaranteeImpressionPayload {
  position: CartServiceGuaranteePosition;
}

/**
 * @description The cart service-guarantee section became visible and stayed in
 *              view for ≥1s. Driven by `<CartServiceGuaranteeImpression />`'s
 *              `useInViewDelayedCallback` + `hasFired` ref (once per mount).
 *              Consumed by `cart-tracking.listener` and mapped to the GA trigger.
 */
export const cartServiceGuaranteeImpressionEvent = createAction<CartServiceGuaranteeImpressionPayload>(
  'cart/serviceGuaranteeImpression'
);
