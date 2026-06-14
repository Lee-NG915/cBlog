'use client';
import React, { useEffect } from 'react';
import { StoreProvider, useUIContext, UIProvider, useApiErrorModal } from '@castlery/shared-components';
import { Unsubscribe } from '@reduxjs/toolkit';
import { setupOrderListeners } from '@castlery/modules-order-services';
import { startAppListening } from '@castlery/shared-redux-store';
import { setupUserListeners, setupWishlistListeners } from '@castlery/modules-user-services';
import { setupProductListeners, setupReviewsListeners } from '@castlery/modules-product-services';
import { setupCompositesListeners, setupApiErrorListeners } from '@castlery/modules-composite-services';
import {
  setupTrackingListeners,
  setupCartTrackingListeners,
  setupPromotionTrackingListeners,
  setupShippingTrackingListeners,
  setupPaymentTrackingListeners,
  setupOrderTrackingListeners,
  setupCheckoutTrackingListeners,
  setupProductTrackingListeners,
} from '@castlery/modules-tracking-services';
import GlobalErrorBoundary from '../../components/GlobalErrorBoundary';
import { setupCartListeners } from '@castlery/modules-cart-services';
import { setupCheckoutListeners } from '@castlery/modules-checkout-services';
import { setupPaymentListeners } from '@castlery/modules-payment-services';
import { setupPromotionListeners } from '@castlery/modules-promotion-services';
import { dt } from '@castlery/data-tracking-events';
import { sharedFeatureService } from '@castlery/shared-services';

export const RegionLayoutClientWithListeners = ({ children }: { children: React.ReactNode }) => {
  const { modal } = useUIContext();
  const [apiModal, apiModalContextHolder] = useApiErrorModal();
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;

  useEffect(() => {
    const subscriptions: Unsubscribe[] = [
      setupUserListeners(startAppListening, { modal }),
      setupProductListeners(startAppListening),
      setupReviewsListeners(startAppListening),
      setupWishlistListeners(startAppListening),
      setupCompositesListeners(startAppListening, { modal }),
      // 如果开启订单v2(ORP)，则订阅cart和tracking侧的cart-tracking监听器
      ...(enableOrderV2
        ? [setupCartListeners(startAppListening), setupCartTrackingListeners(startAppListening)]
        : [setupOrderListeners(startAppListening)]),
      setupPromotionListeners(startAppListening),
      setupPromotionTrackingListeners(startAppListening),
      setupShippingTrackingListeners(startAppListening),
      setupPaymentTrackingListeners(startAppListening),
      setupOrderTrackingListeners(startAppListening),
      setupCheckoutTrackingListeners(startAppListening),
      setupCheckoutListeners(startAppListening, { modal, dt }), // @@abby: will remove dt later after tracking refactor
      setupPaymentListeners(startAppListening),
      setupApiErrorListeners(startAppListening, { apiModal }),
      setupTrackingListeners(startAppListening),
      setupProductTrackingListeners(startAppListening),
    ];

    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [modal, apiModal, enableOrderV2]);

  return (
    <>
      {apiModalContextHolder}
      {children}
    </>
  );
};

export const RegionLayoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <GlobalErrorBoundary>
      <StoreProvider>
        <UIProvider>
          <RegionLayoutClientWithListeners>{children}</RegionLayoutClientWithListeners>
        </UIProvider>
      </StoreProvider>
    </GlobalErrorBoundary>
  );
};
