'use client';
import React from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';
import { clearPosOrderIdAndOrderNumber } from '@castlery/modules-order-domain';
import { useGetPosPaymentMethodConfigsQuery } from '@castlery/modules-payment-domain';
import { sharedFeatureService } from '@castlery/shared-services';

const POS_LISTENERS_READY_EVENT = 'pos:listeners-ready';

export function ProductsListingLayoutClient() {
  const dispatch = useAppDispatch();
  const enabledOrderV2 = sharedFeatureService.enabledOrderV2;

  useGetPosPaymentMethodConfigsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: !enabledOrderV2,
  });

  React.useEffect(() => {
    dispatch(clearPosOrderIdAndOrderNumber());

    let hasTriggered = false;
    const triggerEnterApp = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      dispatch(
        enterApp({
          page: 'discover',
        })
      );
    };

    const readyFlag = (window as Window & { __HAS_POS_LISTENERS_READY__?: boolean }).__HAS_POS_LISTENERS_READY__;
    if (readyFlag) {
      triggerEnterApp();
      return;
    }

    window.addEventListener(POS_LISTENERS_READY_EVENT, triggerEnterApp);
    const timer = window.setTimeout(() => {
      const latestReadyFlag = (window as Window & { __HAS_POS_LISTENERS_READY__?: boolean })
        .__HAS_POS_LISTENERS_READY__;
      if (latestReadyFlag) {
        triggerEnterApp();
      }
    }, 0);

    return () => {
      window.removeEventListener(POS_LISTENERS_READY_EVENT, triggerEnterApp);
      window.clearTimeout(timer);
    };
  }, [dispatch]);

  return null;
}
