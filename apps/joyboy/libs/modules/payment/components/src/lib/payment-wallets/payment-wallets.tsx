'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Box, Stack } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { MarketCurrency } from '@castlery/config';
import {
  selectPaymentMethodConfigs,
  useGetPaymentMethodConfigsQuery,
  PaymentMethodProviderEnum,
  paymentMethodClickedEvent,
  placeOrderClickedEvent,
  type PaymentMethodClickCategory,
  type PlaceOrderClickedLabel,
} from '@castlery/modules-payment-domain';
import { checkoutPaymentMethodSelectedForFunnelEvent } from '@castlery/modules-checkout-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useGetPaymentDataSource, BackdropLoading } from '@castlery/shared-components';
import { useGetFormattedMethodsSettings } from '../hooks/useGetFormattedMethodsSettings';
import { usePaymentCountdown } from '../hooks/use-payment-countdown';
import { usePaymentErrorMessages } from '../hooks/usePaymentErrorMessages';
import { usePaymentErrorHandler } from '../hooks/usePaymentErrorHandler';
import { StripePaymentElement } from '../stripe/stripe-payment-element/stripe-payment-element';
import { PaypalPaymentElement } from '../paypal/paypal-payment-element/paypal-payment-element';
import { AffirmPaymentElement } from '../affirm/affirm-payment-element/affirm-payment-element';
import { ExpressCheckoutElement } from '../stripe/express-checkout-element/express-checkout-element';
import { PaymentWalletsHeader } from './components/payment-wallets-header';
import { PaymentMethodsList } from './components/payment-methods-list';
import { PaymentSubmitSection } from './components/payment-submit-section';
import { PaymentWalletsSkeleton } from './components/payment-wallets-skeleton';
import type { PaymentError, PaymentState } from './payment-wallets.types';
import { useOrderLifecycle } from './hooks/use-order-lifecycle';
import { usePaymentExecution } from './hooks/use-payment-execution';
import { usePaymentMethodSelection } from './hooks/use-payment-method-selection';
import { usePaymentErrorModal } from './hooks/use-payment-error-modal';

export { PaymentWalletsSkeleton };

export interface PaymentWalletsProps {
  orderId: string;
  tauCheckHandler: (onProceed?: () => void) => boolean;
  ExtraComponent?: React.ReactNode;
  defaultSelectedKey?: string;
  isLoading?: boolean;
  /**
   * Override the billing address from the data source.
   * Used when the parent component needs to control which address is passed to the payment SDK
   * (e.g., when "use shipping address as billing address" is selected).
   */
  billingAddress?: ReturnType<typeof useGetPaymentDataSource>['billingAddress'];
  resumeState?: {
    status: 'failure' | 'processing';
    provider?: string;
    paymentId?: string;
    traceId?: string;
    errorCode?: string;
    orderNumber?: string;
  } | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Payment wallets container.
 *
 * Phase 5 architecture — UI only drives the SDK, all business logic lives in Server Actions:
 *   1. elements.submit()          (Stripe only, client-side form validation)
 *   2. createTransactionOrder()   (RTK mutation — checkout validation + order creation;
 *                                  errors handled by CheckoutProcessFailedEvent Redux listener)
 *   3. initiatePaymentAction()    (Server Action — returns ActionSchema)
 *   4. ActionSchema branch:
 *      SDK_CONFIRM → stripe.confirmPayment(clientSecret)
 *      REDIRECT    → window.location.href = redirectUrl
 *      SUCCESS     → skip to step 5
 *   5. capturePaymentAction()     (Server Action — closes the payment loop)
 *   6. redirect to /checkout-success
 */
export function PaymentWallets({
  orderId,
  isLoading = false,
  defaultSelectedKey,
  resumeState = null,
  ExtraComponent,
  tauCheckHandler,
  billingAddress: billingAddressProp,
}: PaymentWalletsProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.paymentWallets',
  });
  const dispatch = useAppDispatch();

  // ─── Core state ───────────────────────────────────────────────────────────

  const [paymentState, setPaymentState] = useState<PaymentState>({
    error: null,
    isProcessing: false,
    isReadyToSubmit: false,
  });

  const { isLoading: isConfigsLoading } = useGetPaymentMethodConfigsQuery();
  const isPaymentConfigsLoading = isConfigsLoading || isLoading;

  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const handleStripeLoadingChange = useCallback((loading: boolean) => setIsStripeLoading(loading), []);

  const paymentErrorMessages = usePaymentErrorMessages();
  const paymentDataSource = useGetPaymentDataSource();
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);
  const billingAddress = billingAddressProp !== undefined ? billingAddressProp : paymentDataSource.billingAddress;
  const orderSummary = paymentDataSource.summary;

  const updatePaymentState = useCallback((updates: Partial<PaymentState>) => {
    setPaymentState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setPaymentError = useCallback(
    (error: PaymentError) => updatePaymentState({ error, isProcessing: false }),
    [updatePaymentState]
  );

  const clearPaymentError = useCallback(() => updatePaymentState({ error: null }), [updatePaymentState]);

  const { handlePaymentError, getErrorMessage } = usePaymentErrorHandler(setPaymentError);

  // ─── Order lifecycle ──────────────────────────────────────────────────────

  const { orderInfo, orderPaymentsHasPending, lastPaymentIdRef, saveNewOrder } = useOrderLifecycle({
    orderId,
    paymentDataSource,
    persistenceHandles,
  });

  // ─── Payment method selection ─────────────────────────────────────────────

  const paymentMethodConfigs = useAppSelector(selectPaymentMethodConfigs);
  const supportedMethods = useGetFormattedMethodsSettings({ paymentMethodConfigs });
  const paymentAmount = orderSummary?.total ? Number(orderSummary.total) : 0;

  const {
    selectedPaymentMethod,
    visibleMethods,
    isStripeSelected,
    isPaypalSelected,
    isAffirmSelected,
    isGrabPaySelected,
    isTwoCTwoPSelected,
    isExpressMethodSelected,
    activeProvider,
    stripePublicKey,
    paypalClientId,
    handleSelectPaymentMethod,
    onExpressMethodsDetected,
  } = usePaymentMethodSelection({ supportedMethods, defaultSelectedKey, updatePaymentState });

  const paymentMethodClickCategory: PaymentMethodClickCategory = useMemo(() => {
    return paymentDataSource.source === 'orderCheckout' || !!orderInfo || resumeState?.status === 'failure'
      ? 'repay'
      : 'pay';
  }, [orderInfo, paymentDataSource.source, resumeState?.status]);

  const placeOrderLabel = useMemo<PlaceOrderClickedLabel>(() => {
    if (paymentDataSource.source === 'orderCheckout') return 'order_retry_payment';
    if (!!orderInfo || resumeState?.status === 'failure') return 'checkout_retry_payment';
    return 'checkout_place_order';
  }, [paymentDataSource.source, orderInfo, resumeState?.status]);

  const placeOrderLabelRef = useRef(placeOrderLabel);
  placeOrderLabelRef.current = placeOrderLabel;
  const activeProviderRef = useRef(activeProvider);
  activeProviderRef.current = activeProvider;

  const dispatchPlaceOrderClick = useCallback(() => {
    const provider = activeProviderRef.current;
    if (!provider) return;
    dispatch(placeOrderClickedEvent({ provider, label: placeOrderLabelRef.current }));
  }, [dispatch]);

  const handleClickPaymentMethod = useCallback(
    (key: string) => {
      const provider = supportedMethods.find((method) => method.key === key)?.provider;
      if (provider) {
        dispatch(paymentMethodClickedEvent({ provider, category: paymentMethodClickCategory }));
        // GA `checkout` funnel step 5 — payment method selected
        dispatch(checkoutPaymentMethodSelectedForFunnelEvent({ option: provider }));
      }
    },
    [dispatch, paymentMethodClickCategory, supportedMethods]
  );

  // ─── Payment execution ────────────────────────────────────────────────────

  const {
    stripeSubmitHandlerRef,
    stripeConfirmHandlerRef,
    twoCTwoPConfirmHandlerRef,
    prepareSdkPayment,
    onStripeCardSubmit,
    onGrabPaySubmit,
    onTwoCTwoPSubmit,
    onExpressCheckoutSubmit,
    onPaypalCapture,
    onAffirmCapture,
    onSdkError,
  } = usePaymentExecution({
    orderInfo,
    lastPaymentIdRef,
    saveNewOrder,
    persistenceHandles,
    activeProvider,
    paymentAmount,
    tauCheckHandler,
    setPaymentError,
    updatePaymentState,
    handlePaymentError,
    paymentErrorMessages,
  });

  // ─── Payment countdown ────────────────────────────────────────────────────

  const { isExpired, formattedCountdown } = usePaymentCountdown(orderInfo?.paymentExpiredAt ?? null);

  const isProcessingRef = useRef(false);
  isProcessingRef.current = paymentState.isProcessing;

  // Q2: Merge expiry paths — when countdown hits 0 and no payment is in flight,
  // funnel into the unified error modal useEffect via setPaymentError.
  // If a payment is in progress, skip here — the backend will return ORDER_EXPIRED
  // and the error modal useEffect will handle it via the orderExpired category branch.
  useEffect(() => {
    if (!isExpired || isProcessingRef.current) return;
    setPaymentError({
      displayType: 'modal',
      category: 'orderExpired',
      message: '',
      orderNumber: orderInfo?.number ?? '',
    });
    // setPaymentError is stable; orderInfo.number is display-only and the orderExpired modal does not render it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  useEffect(() => {
    if (!resumeState) return;

    if (resumeState.status === 'processing') {
      setPaymentError({
        displayType: 'inline',
        message: getErrorMessage('paymentPending'),
      });
      return;
    }

    handlePaymentError(
      {
        failureCode: resumeState.errorCode ?? 'CAPTURE_FAILED',
      },
      {
        orderNumber: resumeState.orderNumber ?? orderInfo?.number ?? '',
      }
    );
  }, [getErrorMessage, handlePaymentError, orderInfo?.number, resumeState, setPaymentError]);

  // ─── Error modal ──────────────────────────────────────────────────────────

  const { contextHolder } = usePaymentErrorModal({
    error: paymentState.error,
    clearPaymentError,
  });

  // ─── Stripe keep-mounted ref ──────────────────────────────────────────────
  // Track whether Stripe element has ever been rendered, so it stays mounted
  // when the user switches to another method (preserves Stripe form state).

  const hasStripeElementRendered = useRef(false);
  useEffect(() => {
    if (isStripeSelected && stripePublicKey && paymentAmount > 0) {
      hasStripeElementRendered.current = true;
    }
  }, [isStripeSelected, stripePublicKey, paymentAmount]);

  const shouldRenderStripeElement = useMemo(() => {
    const hasConfig = !!(stripePublicKey && paymentAmount > 0);
    return hasConfig && (isStripeSelected || hasStripeElementRendered.current);
  }, [isStripeSelected, stripePublicKey, paymentAmount]);

  // GrabPay / 2C2P have no client-side form gating — submit is always ready.
  // Stripe readiness is driven by form state (paymentState.isReadyToSubmit).
  const isSubmitReady = isGrabPaySelected || isTwoCTwoPSelected || paymentState.isReadyToSubmit;

  // ─── Stable refs for ExpressCheckoutElement ───────────────────────────────
  // Prevent useMemo from invalidating ExpressCheckoutElement on every render.

  const tauCheckHandlerRef = useRef(tauCheckHandler);
  tauCheckHandlerRef.current = tauCheckHandler;
  const stableTauCheck = useCallback(() => tauCheckHandlerRef.current(), []);

  const onExpressCheckoutSubmitRef = useRef(onExpressCheckoutSubmit);
  onExpressCheckoutSubmitRef.current = onExpressCheckoutSubmit;
  const stablePlaceOrder = useCallback(
    (opts: Parameters<typeof onExpressCheckoutSubmit>[0]) => {
      dispatchPlaceOrderClick();
      return onExpressCheckoutSubmitRef.current(opts);
    },
    [dispatchPlaceOrderClick]
  );

  // ─── Render slots ─────────────────────────────────────────────────────────

  const renderExpandedContent = useCallback(
    (methodKey: string) => {
      if (methodKey !== PaymentMethodProviderEnum.STRIPE_ONLINE) return null;
      return (
        <Box sx={{ display: isStripeSelected ? 'block' : 'none' }}>
          {shouldRenderStripeElement && stripePublicKey && paymentAmount > 0 && (
            <StripePaymentElement
              methodSettings={{ publicKey: stripePublicKey }}
              paymentInfo={{ amount: paymentAmount, billingAddress }}
              onFormChange={(_, complete) => updatePaymentState({ isReadyToSubmit: complete })}
              onGetStripeSubmitHandler={(handler) => (stripeSubmitHandlerRef.current = handler)}
              onGetStripeConfirmHandler={(handler) => (stripeConfirmHandlerRef.current = handler)}
              onStripeLoadingChange={handleStripeLoadingChange}
            />
          )}
        </Box>
      );
    },
    [
      isStripeSelected,
      shouldRenderStripeElement,
      stripePublicKey,
      paymentAmount,
      billingAddress,
      updatePaymentState,
      handleStripeLoadingChange,
    ]
  );

  const expressSlot = useMemo(() => {
    if (!stripePublicKey || paymentAmount <= 0) return null;
    return (
      <Box id="stripe-express-checkout-element" sx={{ display: isExpressMethodSelected ? 'block' : 'none' }}>
        <ExpressCheckoutElement
          stripePublicKey={stripePublicKey}
          amount={paymentAmount}
          activePaymentProvider={selectedPaymentMethod as PaymentMethodProviderEnum}
          onGetAvailablePaymentMethods={onExpressMethodsDetected}
          prepareCheckHandler={stableTauCheck}
          placeOrderHandler={stablePlaceOrder}
          onError={() => handlePaymentError({}, { orderNumber: orderInfo?.number ?? '' })}
        />
      </Box>
    );
  }, [
    stripePublicKey,
    paymentAmount,
    isExpressMethodSelected,
    selectedPaymentMethod,
    onExpressMethodsDetected,
    stableTauCheck,
    stablePlaceOrder,
    handlePaymentError,
    orderInfo?.number,
  ]);

  const trackedPrepareSdkPayment = useCallback(async () => {
    dispatchPlaceOrderClick();
    return prepareSdkPayment();
  }, [dispatchPlaceOrderClick, prepareSdkPayment]);

  const sdkPaymentSlot = useMemo(() => {
    if (isPaypalSelected && paypalClientId) {
      return (
        <PaypalPaymentElement
          paypalClientId={paypalClientId}
          currency={MarketCurrency}
          tauCheckHandler={tauCheckHandler}
          onInitiate={trackedPrepareSdkPayment}
          onCapture={onPaypalCapture}
          onError={onSdkError}
        />
      );
    }
    if (isAffirmSelected) {
      return (
        <AffirmPaymentElement onInitiate={trackedPrepareSdkPayment} onCapture={onAffirmCapture} onError={onSdkError} />
      );
    }
    return null;
  }, [
    isPaypalSelected,
    isAffirmSelected,
    paypalClientId,
    trackedPrepareSdkPayment,
    onPaypalCapture,
    onAffirmCapture,
    onSdkError,
  ]);

  const activeSubmitHandler = useMemo(() => {
    let handler: ((...args: any[]) => any) | undefined;
    if (isStripeSelected) handler = onStripeCardSubmit;
    else if (isGrabPaySelected) handler = onGrabPaySubmit;
    else if (isTwoCTwoPSelected) handler = onTwoCTwoPSubmit;
    if (!handler) return undefined;
    const h = handler;
    return (...args: any[]) => {
      dispatchPlaceOrderClick();
      return h(...args);
    };
  }, [
    isStripeSelected,
    isGrabPaySelected,
    isTwoCTwoPSelected,
    onStripeCardSubmit,
    onGrabPaySubmit,
    onTwoCTwoPSubmit,
    dispatchPlaceOrderClick,
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={{ minHeight: 400, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        <BackdropLoading loading={paymentState.isProcessing || isPaymentConfigsLoading || isStripeLoading} />
        <PaymentWalletsHeader title={t('title')} secureLabel={t('secureAndEncrypted' as any)} />
        {isPaymentConfigsLoading ? (
          <PaymentWalletsSkeleton />
        ) : (
          <PaymentMethodsList
            methods={visibleMethods as any[]}
            selectedKey={selectedPaymentMethod}
            onSelect={handleSelectPaymentMethod}
            onMethodClick={handleClickPaymentMethod}
            renderExpandedContent={renderExpandedContent}
            isExpandedLayout={isStripeSelected}
          />
        )}
        <Stack>{ExtraComponent}</Stack>
        <PaymentSubmitSection
          isLoading={paymentState.isProcessing}
          isDisabled={!isSubmitReady || isExpired}
          showSubmitButton={isStripeSelected || isGrabPaySelected || isTwoCTwoPSelected}
          onSubmit={activeSubmitHandler}
          isOrderCreatedProp={!!orderInfo?.id}
          submitLabel={
            orderInfo && orderPaymentsHasPending !== false
              ? `${t('makePayment', { defaultValue: 'Make Payment' })}${
                  formattedCountdown ? ` (${formattedCountdown})` : ''
                }`
              : t('placeOrder', { defaultValue: 'Place your order' })
          }
          expressSlot={expressSlot}
          sdkSlot={sdkPaymentSlot}
          inlineError={paymentState.error?.displayType === 'inline' ? paymentState.error.message : undefined}
        />
      </Box>
      {contextHolder}
    </>
  );
}
