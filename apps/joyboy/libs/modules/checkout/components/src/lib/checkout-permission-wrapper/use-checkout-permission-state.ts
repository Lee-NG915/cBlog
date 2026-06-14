'use client';
import { useEffect, useMemo } from 'react';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { selectCheckoutRoot, selectIsZeroOrder } from '@castlery/modules-checkout-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

export type CheckoutPermissionState = {
  hasCheckoutPermission: boolean;
  hasLoggedIn: boolean;
  hasShippingMethodConfirmed: boolean;
  hasPaymentPageNonZeroVisited: boolean;
  checkoutRoot: ReturnType<typeof selectCheckoutRoot>;
  isZeroOrder: boolean;
};

export const useCheckoutPermissionState = (isOnAddressPage: boolean): CheckoutPermissionState => {
  // makePersistenceHandles 会创建 30+ handle 对象，useMemo 避免每次 render 重新创建
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);
  const checkoutRoot = useAppSelector(selectCheckoutRoot);
  const isZeroOrder = useAppSelector(selectIsZeroOrder);

  // 进入 address 页时重置 method 步骤标记
  // useEffect 避免在 render body 执行 side effect，防止 Strict Mode 下重复执行
  useEffect(() => {
    if (isOnAddressPage) {
      persistenceHandles.shippingMethodStepConfirmed.removeItem();
      persistenceHandles.paymentPageNonZeroVisited.removeItem();
    }
  }, [isOnAddressPage, persistenceHandles]);

  return {
    hasCheckoutPermission: !!persistenceHandles.xCheckoutSessionToken.hasItem(),
    hasLoggedIn: !!persistenceHandles.webAccessToken.hasItem(),
    hasShippingMethodConfirmed: !!persistenceHandles.shippingMethodStepConfirmed.hasItem(),
    hasPaymentPageNonZeroVisited: !!persistenceHandles.paymentPageNonZeroVisited.hasItem(),
    checkoutRoot,
    isZeroOrder,
  };
};
