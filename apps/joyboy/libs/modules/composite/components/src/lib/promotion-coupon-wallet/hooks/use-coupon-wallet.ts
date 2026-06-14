'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBreakpoints, type SxProps } from '@castlery/fortress';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { getYotpoCustomerDetails, getYotpoRedemptionOptions } from '@castlery/modules-promotion-domain';
import { logger } from '@castlery/observability';
import { accessInWeb } from '@castlery/config';
import { type CouponSchema, type CouponListSchema } from '@castlery/types';
import { type Customer } from '@castlery/modules-user-domain';
import { type CouponWalletMode } from '../coupon-wallet-policy';

export interface CouponWalletProps {
  mode?: CouponWalletMode;
  coupon: CouponSchema | null;
  availableCoupons: CouponListSchema[] | null;
  reloadCartLoading: boolean;
  cartActionLoading: boolean;
  applyCoupon: (couponCode: string) => Promise<{ error?: unknown }>;
  applyLoading: boolean;
  removeCoupon: () => { unwrap: () => Promise<unknown> };
  removeLoading: boolean;
  currentUser: Customer | null;
  /** Wallet-level lock: dims label, blocks dropdown open, resets edit mode (e.g. POS order created, external disable) */
  isLocked?: boolean;
  /** Called after credits are successfully redeemed; behaviour differs per context (cart vs checkout) */
  onAfterRedeemCredits?: () => Promise<void>;
}

export function useCouponWallet({
  coupon,
  availableCoupons,
  reloadCartLoading,
  cartActionLoading,
  removeCoupon,
  removeLoading,
  currentUser,
  isLocked = false,
}: CouponWalletProps) {
  const { desktop, mobile, tablet } = useBreakpoints();
  const dispatch = useAppDispatch();

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const hasLogin = useMemo(() => !!currentUser?.id, [currentUser?.id]);
  const usedValidCouponInCart = useMemo(() => !!coupon?.code && coupon.isValid, [coupon?.code, coupon?.isValid]);
  const availableCouponsCount = useMemo(
    () => availableCoupons?.filter((c) => c.state === 0).length ?? 0,
    [availableCoupons]
  );
  // Button/link-level disabled: any reason the Add/Remove button or link should appear disabled right now.
  // Includes wallet-level lock so consumers don't need to merge again.
  const couponActionDisabled = removeLoading || reloadCartLoading || cartActionLoading || isLocked;

  const usedInvalidCoupon = useMemo(() => {
    if (coupon?.code && !coupon.isValid) return coupon;
    return null;
  }, [coupon]);

  // Silent-invalid: backend returned isValid:false with an invalidReason but stripped the code.
  // The row needs to surface the reason since there's no code to anchor the edit-mode flow.
  const invalidCouponNotice = useMemo(() => {
    if (!coupon?.code && coupon?.isValid === false && coupon?.invalidReason) return coupon.invalidReason;
    return null;
  }, [coupon?.code, coupon?.isValid, coupon?.invalidReason]);

  useEffect(() => {
    if (isLocked) setIsEditMode(false);
  }, [isLocked]);

  useEffect(() => {
    if (usedInvalidCoupon) {
      setHasOpenedOnce(true);
      setIsEditMode(true);
    }
  }, [usedInvalidCoupon]);

  useEffect(() => {
    if (invalidCouponNotice) setIsEditMode(false);
  }, [invalidCouponNotice]);

  const containerSx = useMemo<SxProps>(
    () =>
      accessInWeb
        ? {
            ...(mobile && { p: 4 }),
            ...(tablet && { py: 5, px: 6 }),
            ...(desktop && { py: 5, px: 6 }),
            cursor: usedValidCouponInCart || !hasLogin ? 'default' : 'pointer',
          }
        : null,
    [mobile, tablet, desktop, usedValidCouponInCart, hasLogin]
  );

  const refreshWalletCredits = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.email) return;
    try {
      await Promise.all([
        dispatch(getYotpoCustomerDetails.initiate(currentUser.email)),
        dispatch(
          getYotpoRedemptionOptions.initiate({
            customerId: currentUser.id,
            customerEmail: currentUser.email,
          })
        ),
      ]);
    } catch (error) {
      logger.error('Failed to refresh wallet credits:', { error });
    }
  }, [currentUser?.id, currentUser?.email, dispatch]);

  const handleOpenCouponDropdown = useCallback(async () => {
    if (isLocked) return;
    await refreshWalletCredits();
    setHasOpenedOnce(true);
    setIsEditMode(true);
  }, [refreshWalletCredits, isLocked]);

  const handleRemoveCoupon = useCallback(async () => {
    if (removeLoading || isLocked) {
      return;
    }
    try {
      await removeCoupon().unwrap();
      await handleOpenCouponDropdown();
    } catch (error) {
      logger.error('Failed to remove coupon:', { error });
    }
  }, [removeCoupon, handleOpenCouponDropdown, removeLoading, isLocked]);

  const handleExitEditMode = useCallback(() => setIsEditMode(false), []);

  const handleClickRow = useCallback(() => {
    if (usedValidCouponInCart || !hasLogin || couponActionDisabled) return;
    handleOpenCouponDropdown();
  }, [usedValidCouponInCart, hasLogin, handleOpenCouponDropdown, couponActionDisabled]);

  return {
    isEditMode,
    hasOpenedOnce,
    mobile,
    hasLogin,
    usedValidCouponInCart,
    availableCouponsCount,
    couponActionDisabled,
    usedInvalidCoupon,
    invalidCouponNotice,
    containerSx,
    handleOpenCouponDropdown,
    handleRemoveCoupon,
    handleExitEditMode,
    handleClickRow,
    removeLoading,
  };
}
