'use client';
import { useCallback } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { type Customer } from '@castlery/modules-user-domain';
import { checkoutCreditsRedeemedEvent } from '@castlery/modules-promotion-domain';
import { CouponWallet } from './coupon-wallet';
import { useCouponWalletAdapter } from './hooks/use-coupon-wallet-adapter';

export function CheckoutCouponWallet({
  currentUser,
  disabled = false,
}: {
  currentUser: Customer | null;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const adapter = useCouponWalletAdapter('checkout');

  const handleAfterRedeemCredits = useCallback(async () => {
    dispatch(checkoutCreditsRedeemedEvent());
  }, [dispatch]);

  return (
    <CouponWallet
      mode="checkout"
      {...adapter}
      currentUser={currentUser}
      isLocked={disabled}
      onAfterRedeemCredits={handleAfterRedeemCredits}
    />
  );
}
