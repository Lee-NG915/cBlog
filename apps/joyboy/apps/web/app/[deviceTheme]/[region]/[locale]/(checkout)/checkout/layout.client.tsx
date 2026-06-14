'use client';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef, useState } from 'react';
import { WebCheckoutLayout } from '@castlery/modules-checkout-components';
import { useGetTransactionStepStates } from '@castlery/shared-components';

export const CheckoutLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const enterAppFired = useRef(false);
  const { currentStep } = useGetTransactionStepStates();

  useEffect(() => {
    if (enterAppFired.current || !currentStep?.stepName) return;
    const page = currentStep.stepName;
    if (page) {
      enterAppFired.current = true;
      dispatch(enterApp({ page: page as any }));
    }
  }, [dispatch, currentStep?.stepName]);

  const useSingleChildLayout = currentStep?.useSingleChildLayout ?? false;

  return <WebCheckoutLayout useSingleChildLayout={useSingleChildLayout}>{children}</WebCheckoutLayout>;
};

export default CheckoutLayoutClient;
