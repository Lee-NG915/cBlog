'use client';
import { useCallback } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import {
  selectFilteredCouponGifts,
  useLazyGetGiftsByCouponCodeQuery,
  VoucherType,
  type CouponItemV2,
} from '@castlery/modules-promotion-domain';
import { isCouponGiftsCached, markCouponGiftsCached } from '@castlery/modules-promotion-services';

/**
 * Provides coupon gift data for a given coupon with lazy loading and session-level soft cache.
 *
 * - fetchCouponGifts(): triggers fetch only when called (e.g. when user selects a
 *   gift-type coupon to open the GiftsGallery modal). Skips fetch if this couponCode
 *   has already been fetched in the current session (soft cache in gift.helper.ts).
 * - Cache is invalidated automatically after gift add-to-cart success
 *   (handled by promotion.listener.ts).
 *
 * @param coupon - The coupon item. Pass null/undefined when no coupon is selected.
 */
export function useCouponGifts(coupon: CouponItemV2 | null | undefined) {
  const [trigger, { isLoading }] = useLazyGetGiftsByCouponCodeQuery();
  const couponGifts = useAppSelector(selectFilteredCouponGifts);

  const isFreeGiftCoupon = coupon?.voucherType === VoucherType.FREE_GIFT;

  const fetchCouponGifts = useCallback(async () => {
    if (!coupon?.code || !isFreeGiftCoupon) return;

    // Session-level soft cache: skip if already fetched since last page load / gift add-to-cart
    if (isCouponGiftsCached(coupon.code)) return;

    const result = await trigger(coupon.code);
    if (!result.error) {
      markCouponGiftsCached(coupon.code);
    }
  }, [coupon?.code, isFreeGiftCoupon, trigger]);

  return {
    couponGifts,
    isFreeGiftCoupon,
    isLoading,
    fetchCouponGifts,
  };
}
