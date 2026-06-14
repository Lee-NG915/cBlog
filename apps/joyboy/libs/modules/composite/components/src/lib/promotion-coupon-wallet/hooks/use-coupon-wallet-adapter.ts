'use client';
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { basePageConfig } from '@castlery/config';
// @ts-ignore - Type definitions may not be up to date
import {
  selectCartCoupon,
  selectCartCouponList,
  selectReloadCartLoading,
  selectCartActionLoading,
} from '@castlery/modules-cart-domain';
import { selectCheckoutCoupon, selectAvailableCheckoutCoupons } from '@castlery/modules-checkout-domain';
import {
  useAddCouponToCartMutation,
  useCheckoutAddCouponToCartMutation,
  useRemoveCouponFromCartMutation,
  useCheckoutRemoveCouponFromCartMutation,
  type AppliedCouponCategory,
} from '@castlery/modules-promotion-domain';
import { addCouponToCartCommand, addCouponToCheckoutCommand } from '@castlery/modules-promotion-services';
import { CouponSchema, CouponListSchema } from '@castlery/types';
import { type CouponWalletMode } from '../coupon-wallet-policy';

const CHECKOUT_APPLIED_COUPON_CATEGORIES: { pathname: string; category: AppliedCouponCategory }[] = [
  { pathname: basePageConfig['checkout-shipping-address'], category: 'checkout_shipping_address' },
  { pathname: basePageConfig['checkout-shipping-method'], category: 'checkout_shipping_method' },
  { pathname: basePageConfig['checkout-payment'], category: 'checkout_payment' },
];

const getAppliedCouponCategory = (mode: CouponWalletMode, pathname: string): AppliedCouponCategory => {
  if (mode === 'cart') {
    return 'cart_coupon';
  }

  const normalizedPathname = pathname.toLowerCase();
  return (
    CHECKOUT_APPLIED_COUPON_CATEGORIES.find(({ pathname: checkoutPathname }) =>
      normalizedPathname.includes(checkoutPathname)
    )?.category ?? 'cart_coupon'
  );
};

/**
 * Adapter hook that unifies cart and checkout coupon data sources and mutation operations.
 * Both sets of mutation hooks must always be called (no conditional hook calls).
 * The `mode` param selects which set of data/operations is exposed.
 */
export function useCouponWalletAdapter(mode: CouponWalletMode) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { coupon, availableCoupons, reloadCartLoading, cartActionLoading } = useAppSelector((state) => ({
    coupon: (mode === 'checkout' ? selectCheckoutCoupon(state) : selectCartCoupon(state)) as CouponSchema | null,
    availableCoupons: (mode === 'checkout' ? selectAvailableCheckoutCoupons(state) : selectCartCouponList(state)) as
      | CouponListSchema[]
      | null,
    reloadCartLoading: selectReloadCartLoading(state),
    cartActionLoading: selectCartActionLoading(state),
  }));
  // Mutation hooks are kept solely to expose the per-scope loading flag; the actual
  // mutation call is orchestrated inside the apply-coupon command thunks (which dispatch
  // `appliedCouponActionSucceededEvent` on success for tracking listeners to consume).
  const [cartApply, { isLoading: cartApplyLoading }] = useAddCouponToCartMutation();
  const [checkoutApply, { isLoading: checkoutApplyLoading }] = useCheckoutAddCouponToCartMutation();
  const [cartRemove, { isLoading: cartRemoveLoading }] = useRemoveCouponFromCartMutation();
  const [checkoutRemove, { isLoading: checkoutRemoveLoading }] = useCheckoutRemoveCouponFromCartMutation();

  const isCheckout = mode === 'checkout';

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      const category = getAppliedCouponCategory(mode, pathname || '');
      const action = isCheckout
        ? await dispatch(addCouponToCheckoutCommand({ couponCode, category, trigger: checkoutApply }))
        : await dispatch(addCouponToCartCommand({ couponCode, category, trigger: cartApply }));
      if (action.meta.requestStatus === 'rejected') {
        return { error: action.payload };
      }
      return { data: action.payload };
    },
    [isCheckout, mode, pathname, cartApply, checkoutApply, dispatch]
  );

  const removeCoupon = useCallback(
    // checkoutRemoveCouponFromCart requires { couponCode }, cartRemoveCouponFromCart takes void.
    // The adapter reads the current coupon code internally so callers stay arg-free.
    () => (isCheckout ? checkoutRemove({ couponCode: coupon?.code || '' }) : cartRemove(undefined as void)),
    [isCheckout, cartRemove, checkoutRemove, coupon?.code]
  );

  return {
    coupon,
    availableCoupons,
    reloadCartLoading,
    cartActionLoading,
    applyCoupon,
    applyLoading: isCheckout ? checkoutApplyLoading : cartApplyLoading,
    removeCoupon,
    removeLoading: isCheckout ? checkoutRemoveLoading : cartRemoveLoading,
  };
}
