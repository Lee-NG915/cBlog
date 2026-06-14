import { createAction } from '@reduxjs/toolkit';

export type AppliedCouponCategory =
  | 'cart_coupon'
  | 'checkout_shipping_address'
  | 'checkout_shipping_method'
  | 'checkout_payment';

export interface AppliedCouponActionSucceededPayload {
  couponCode: string;
  category: AppliedCouponCategory;
}

/**
 * @description Dispatched after a successful apply-coupon command (cart or checkout scope).
 * The payload carries the surface category required by tracking triggers so they do not
 * infer it from route or store state.
 * Tracking listeners subscribe to this semantic event instead of RTK mutation matchers,
 * mirroring the cart-tracking model in `addedCartActionSucceededEvent`.
 */
export const appliedCouponActionSucceededEvent = createAction<AppliedCouponActionSucceededPayload>(
  'promotion/appliedCouponActionSucceeded'
);
