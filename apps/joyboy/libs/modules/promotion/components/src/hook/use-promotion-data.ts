'use client';
import { useMemo } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectAvailableCartCoupons, selectGiftPools } from '@castlery/modules-cart-domain';
import { selectAvailableCheckoutCoupons } from '@castlery/modules-checkout-domain';
import type { CouponListSchema, GiftPoolSchema } from '@castlery/types';

export type PromotionMode = 'cart' | 'checkout';

export interface PromotionData {
  couponList: CouponListSchema[];
  giftPools: GiftPoolSchema[];
  // freeShipping: TODO - pending shippingFee field structure confirmation
}

/**
 * Aggregates promotion-related data for the given mode (cart or checkout).
 * - couponList: available coupons for the current context
 * - giftPools: campaign gift pools from cart (cart-only, shared across both modes)
 */
export function usePromotionData(mode: PromotionMode): PromotionData {
  const selectCouponList = useMemo(
    () => (mode === 'checkout' ? selectAvailableCheckoutCoupons : selectAvailableCartCoupons),
    [mode]
  );

  const couponList = useAppSelector(selectCouponList) as CouponListSchema[];
  const giftPools = useAppSelector(selectGiftPools) as GiftPoolSchema[];

  return { couponList, giftPools };
}
