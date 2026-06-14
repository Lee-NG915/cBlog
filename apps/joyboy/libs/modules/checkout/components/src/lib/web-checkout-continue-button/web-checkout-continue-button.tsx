'use client';
import { Button, Stack } from '@castlery/fortress';
import { CustomLink, PlaceOrderButton, useHasOrderCreated } from '@castlery/shared-components';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useWebCheckoutSteps } from '../hooks/use-web-checkout-steps';
import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import {
  selectCheckoutAddress,
  useValidateCheckoutAddressMutation,
  selectIsZeroOrder,
  selectHasCheckoutRoot,
  selectDeliveryRequests,
  selectLocalDeliveryRequests,
  useUpdateCheckoutShippingMethodMutation,
  selectFetchCheckoutDataLoading,
  selectAssemblyPreference,
  selectShippingPreference,
  checkoutShippingAddressStepCompletedEvent,
  checkoutShippingMethodStepCompletedEvent,
} from '@castlery/modules-checkout-domain';
import { createTransactionOrderCommand } from '@castlery/shared-services';
import { EcEnv, basePageConfig, accessInSG } from '@castlery/config';

export interface WebCheckoutContinueButtonProps {
  loading?: boolean;
  disabled?: boolean;
  tauCheckHandler?: (onProceed?: () => void) => boolean;
  /** When true (e.g. on payment page with orderId), Back button is hidden */
  isOrderCreated?: boolean;
}

export const WebCheckoutContinueButton = ({
  loading = false,
  disabled = false,
  tauCheckHandler,
  isOrderCreated: isOrderCreatedProp,
}: WebCheckoutContinueButtonProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPages.buttons',
  });
  const hasCheckoutRoot = useAppSelector(selectHasCheckoutRoot);
  const fetchCheckoutDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const hasOrderCreatedFromPersistence = useHasOrderCreated();
  const isOrderCreated = isOrderCreatedProp ?? hasOrderCreatedFromPersistence;
  const checkoutAddress = useAppSelector(selectCheckoutAddress);
  const isZeroOrder = useAppSelector(selectIsZeroOrder);
  const deliveryRequests = useAppSelector(selectDeliveryRequests);
  const localDeliveryRequests = useAppSelector(selectLocalDeliveryRequests);
  const assemblyPreference = useAppSelector(selectAssemblyPreference);
  const shippingPreference = useAppSelector(selectShippingPreference);
  const [validateCheckoutAddress, { isLoading: validateCheckoutAddressLoading }] = useValidateCheckoutAddressMutation();
  const [updateCheckoutShippingMethod, { isLoading: updateShippingMethodLoading }] =
    useUpdateCheckoutShippingMethodMutation();
  const pathname = usePathname();
  const baseSteps = useWebCheckoutSteps();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createOrderLoading, setCreateOrderLoading] = useState(false);

  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);

  const { prevStep, currentStep, nextStep } = useMemo(() => {
    const currentStep = baseSteps.find((step) => step.href === pathname);
    const index = currentStep?.level ?? -1;
    const nextStep = index >= 0 ? baseSteps[index + 1] ?? null : null;
    const prevStep = index >= 0 ? baseSteps[index - 1] ?? null : null;
    return { prevStep, nextStep, currentStep };
  }, [baseSteps, pathname]);

  const continueButtonLoading =
    validateCheckoutAddressLoading || updateShippingMethodLoading || loading || fetchCheckoutDataLoading;
  const continueDisabled = !hasCheckoutRoot || disabled;
  const displayOrderButton = isZeroOrder && currentStep?.level !== 0;

  const handleValidateCheckoutAddress = useCallback(async () => {
    if (continueButtonLoading || !checkoutAddress) {
      return;
    }
    if (!nextStep?.href) {
      return;
    }
    const res = await validateCheckoutAddress({ addressId: checkoutAddress.id });
    if ('error' in res) {
      return;
    }
    // GA `checkout` funnel step 2 — shipping address step completed
    dispatch(checkoutShippingAddressStepCompletedEvent());
    router.push(nextStep.href);
  }, [checkoutAddress, continueButtonLoading, dispatch, nextStep?.href, router, validateCheckoutAddress]);

  const handleContinue = useCallback(async () => {
    if (!nextStep?.href) return;
    if (currentStep?.level === 0) {
      await handleValidateCheckoutAddress();
      return;
    }
    if (currentStep?.level === 1) {
      const serverDeliveryText = deliveryRequests?.text ?? '';
      if (serverDeliveryText !== localDeliveryRequests) {
        const res = await updateCheckoutShippingMethod({ deliveryRequests: localDeliveryRequests });
        if ('error' in res) return;
      }
      persistenceHandles.shippingMethodStepConfirmed.setItem('true');
      // GA `checkout` funnel step 4 — shipping method completed.
      // option = SG 走 assemblyPreference / 非 SG 走 shippingPreference 的 active 项
      const option = accessInSG
        ? assemblyPreference?.find((item) => item.active)?.name ?? ''
        : shippingPreference?.find((item) => item.active)?.shippingType ?? '';
      dispatch(checkoutShippingMethodStepCompletedEvent({ option }));
      router.push(nextStep.href);
    }
  }, [
    assemblyPreference,
    currentStep?.level,
    deliveryRequests,
    dispatch,
    handleValidateCheckoutAddress,
    localDeliveryRequests,
    nextStep?.href,
    persistenceHandles,
    router,
    shippingPreference,
    updateCheckoutShippingMethod,
  ]);

  const placeOrderCore = useCallback(async () => {
    setCreateOrderLoading(true);
    try {
      const res = await dispatch(createTransactionOrderCommand());
      if ('error' in res) {
        return;
      }
      const { orderId } = res.payload;
      const checkoutSuccessUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
        basePageConfig['checkout-success']
      }`;
      window.location.replace(`${checkoutSuccessUrl}?orderId=${orderId}`);
    } finally {
      setCreateOrderLoading(false);
    }
  }, [dispatch]);

  const handlePlaceFreeOrder = useCallback(async () => {
    // 支付步骤需要先通过 T&C 校验；未勾选时弹窗会自带 onProceed 回调继续下单
    if (currentStep?.linkKey === 'checkout-payment') {
      if (typeof tauCheckHandler !== 'function' || !tauCheckHandler(placeOrderCore)) {
        return;
      }
    }
    await placeOrderCore();
  }, [tauCheckHandler, currentStep?.linkKey, placeOrderCore]);

  const backButton = prevStep ? (
    <Button
      variant="outlined"
      disabled={isOrderCreated}
      linkKey={prevStep.linkKey}
      component={CustomLink}
      sx={{ minWidth: 154 }}
    >
      {t('back')}
    </Button>
  ) : null;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row-reverse' }}
      justifyContent="space-between"
      sx={{ mt: displayOrderButton ? 8 : 0, gap: 4 }}
    >
      {displayOrderButton ? (
        <>
          <PlaceOrderButton
            label={t('placeOrder', { defaultValue: 'Place your order' })}
            disabled={continueDisabled}
            loading={createOrderLoading}
            onClick={handlePlaceFreeOrder}
            data-selenium={currentStep?.dataSeleniumId}
          />
          {backButton}
        </>
      ) : (
        <>
          <Button
            disabled={continueDisabled}
            loading={continueButtonLoading}
            onClick={handleContinue}
            data-selenium={currentStep?.dataSeleniumId}
            sx={{ minWidth: 154 }}
          >
            {t('continue')}
          </Button>
          {backButton}
        </>
      )}
    </Stack>
  );
};
