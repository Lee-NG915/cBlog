'use client';
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { type Customer } from '@castlery/modules-user-domain';
import { selectPosOrderId } from '@castlery/modules-order-domain';
import { cartCreditsRedeemedEvent } from '@castlery/modules-promotion-domain';
import { CouponWallet } from './coupon-wallet';
import { useCouponWalletAdapter } from './hooks/use-coupon-wallet-adapter';

export function CartCouponWallet({
  currentUser,
  disabled = false,
}: {
  currentUser: Customer | null;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const posOrderId = useAppSelector(selectPosOrderId);
  const adapter = useCouponWalletAdapter('cart');

  const handleAfterRedeemCredits = useCallback(async () => {
    dispatch(cartCreditsRedeemedEvent());
  }, [dispatch]);

  return (
    <CouponWallet
      mode="cart"
      {...adapter}
      currentUser={currentUser}
      isLocked={!!posOrderId || !!disabled}
      onAfterRedeemCredits={handleAfterRedeemCredits}
    />
  );
}
