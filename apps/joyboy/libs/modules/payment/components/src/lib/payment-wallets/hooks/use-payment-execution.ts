'use client';
import { useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import {
  PaymentMethodProviderEnum,
  useDeleteOrderPaymentMutation,
  webPaymentCapturedEvent,
} from '@castlery/modules-payment-domain';
import { useCreateTransactionOrderMutation } from '@castlery/modules-order-domain';
import { MarketCurrency } from '@castlery/config';
import { initiatePaymentAction } from '@castlery/modules-payment-actions';
import { useAppDispatch } from '@castlery/shared-redux-store';
import {
  captureStructuredError,
  BUSINESS_DOMAIN,
  addBreadcrumb,
  logger,
  TransactionActionType,
  TransactionDomain,
  TransactionErrorCategory,
  captureTransactionError,
  trackTransactionFailure,
  trackTransactionStart,
  trackTransactionSuccess,
  type TransactionObservabilityContext,
} from '@castlery/observability/client';
import { captureWithRetry } from '../utils/capture-with-retry';
import { extractClientError } from '../utils/extract-error-message';
import type { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import type { PaymentError, PaymentState } from '../payment-wallets.types';
import type { IPaymentProcessingError } from '../types';
import type { PaymentErrorMessages } from '../../hooks/usePaymentErrorMessages';
import type { UsePaymentErrorHandlerReturn } from '../../hooks/usePaymentErrorHandler';
import type { SdkInitiateResult } from '../../paypal/paypal-payment-element/paypal-payment-element';
import { readCheckoutToken, type OrderInfo } from './use-order-lifecycle';
import { checkoutSuccessPath } from '../constants';

export function usePaymentExecution({
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
}: {
  orderInfo: OrderInfo | null;
  lastPaymentIdRef: MutableRefObject<string | null>;
  saveNewOrder: (info: OrderInfo, checkoutToken: string) => void;
  persistenceHandles: ReturnType<typeof makePersistenceHandles>;
  activeProvider: PaymentMethodProviderEnum | undefined;
  paymentAmount: number;
  tauCheckHandler: (onProceed?: () => void) => boolean;
  setPaymentError: (error: PaymentError) => void;
  updatePaymentState: (updates: Partial<PaymentState>) => void;
  handlePaymentError: UsePaymentErrorHandlerReturn['handlePaymentError'];
  paymentErrorMessages: PaymentErrorMessages;
}) {
  const attemptIdRef = useRef<string | null>(null);
  const traceIdRef = useRef<string | null>(null);

  const stripeSubmitHandlerRef = useRef<(() => Promise<boolean | IPaymentProcessingError>) | null>(null);
  const stripeConfirmHandlerRef = useRef<
    ((clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>) | null
  >(null);
  // TODO: wire to TcTpPaymentElement once 2C2P SDK element is integrated
  const twoCTwoPConfirmHandlerRef = useRef<
    ((paymentToken: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>) | null
  >(null);

  const [deleteOrderPayment] = useDeleteOrderPaymentMutation();
  const [createOrder] = useCreateTransactionOrderMutation();
  const dispatch = useAppDispatch();

  const buildClientContext = useCallback(
    (
      step: TransactionObservabilityContext['step'],
      overrides?: Partial<TransactionObservabilityContext>
    ): TransactionObservabilityContext => ({
      domain: step === 'create_order' ? TransactionDomain.CHECKOUT : TransactionDomain.PAYMENT,
      step,
      traceId: traceIdRef.current ?? undefined,
      attemptId: attemptIdRef.current ?? undefined,
      orderId: orderInfo?.id,
      orderNumber: orderInfo?.number,
      paymentId: lastPaymentIdRef.current ?? undefined,
      provider: activeProvider,
      paymentAmount,
      currency: MarketCurrency,
      ...overrides,
    }),
    [activeProvider, lastPaymentIdRef, orderInfo, paymentAmount]
  );

  const createAttemptId = useCallback(() => {
    const nextAttemptId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `attempt-${Date.now()}`;
    attemptIdRef.current = nextAttemptId;
    return nextAttemptId;
  }, []);

  const createTraceId = useCallback(() => {
    const nextTraceId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `trace-${Date.now()}`;
    traceIdRef.current = nextTraceId;
    return nextTraceId;
  }, []);

  const startPaymentAttempt = useCallback(() => {
    createAttemptId();
    createTraceId();
  }, [createAttemptId, createTraceId]);

  /**
   * Shared pre-initiate pipeline: create order (if needed) → delete stale payment → initiate.
   * Used by runPaymentPipeline (Stripe / GrabPay / 2C2P / Express) and prepareSdkPayment (PayPal / Affirm).
   * Returns the successful initiate result, or null if any step failed (error state already set).
   */
  const buildOrderAndInitiate = useCallback(async () => {
    // ── Step 1: Create order if not yet created ──────────────────────────────
    // Errors handled by the Redux CheckoutProcessFailedEvent listener.
    let currentOrderInfo = orderInfo;
    if (!currentOrderInfo) {
      trackTransactionStart(buildClientContext('create_order'));
      const checkoutToken = readCheckoutToken(persistenceHandles);
      if (!checkoutToken?.trim()) {
        trackTransactionFailure(
          buildClientContext('create_order', {
            errorCode: 'CHECKOUT_TOKEN_MISSING',
            errorCategory: TransactionErrorCategory.VALIDATION_ERROR,
            errorMessage: paymentErrorMessages.createOrderFailed,
          }),
          {
            message: 'transaction.checkout.create_order.failure',
            skipSentry: true,
          }
        );
        setPaymentError({ message: paymentErrorMessages.createOrderFailed, displayType: 'inline' });
        return null;
      }
      try {
        addBreadcrumb({ message: 'createOrder start', domain: BUSINESS_DOMAIN.PAYMENT, data: { activeProvider } });
        const orderData = await createOrder({}).unwrap();
        const paymentExpiredAt =
          typeof orderData === 'object' && orderData !== null && 'paymentExpiredAt' in orderData
            ? (orderData as { paymentExpiredAt?: string }).paymentExpiredAt
            : undefined;
        currentOrderInfo = {
          id: orderData.orderId ?? '',
          referenceNumber: orderData.referenceNumber ?? '',
          number: orderData.number ?? '',
          paymentExpiredAt,
        };
        addBreadcrumb({
          message: 'createOrder success',
          domain: BUSINESS_DOMAIN.PAYMENT,
          data: { orderId: currentOrderInfo.id, orderNumber: currentOrderInfo.number },
        });
        saveNewOrder(currentOrderInfo, checkoutToken);
        trackTransactionSuccess(
          buildClientContext('create_order', {
            orderId: currentOrderInfo.id,
            orderNumber: currentOrderInfo.number,
          }),
          {
            message: 'transaction.checkout.create_order.success',
            skipSentry: true,
          }
        );
      } catch {
        trackTransactionFailure(
          buildClientContext('create_order', {
            errorCode: 'CREATE_ORDER_FAILED',
            errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
            errorMessage: paymentErrorMessages.createOrderFailed,
          }),
          {
            message: 'transaction.checkout.create_order.failure',
            skipSentry: true,
          }
        );
        updatePaymentState({ isProcessing: false });
        return null;
      }
    }

    // ── Step 2: Cleanup stale pending payment from a previous failed attempt ─
    if (lastPaymentIdRef.current && currentOrderInfo.id) {
      try {
        await deleteOrderPayment({ orderId: currentOrderInfo.id, paymentId: lastPaymentIdRef.current }).unwrap();
        lastPaymentIdRef.current = null;
      } catch (e) {
        const { code: failureCode, message: errorMessage } = extractClientError(e);
        logger.error('[buildOrderAndInitiate] deleteOrderPayment failed', {
          error: e,
          orderId: currentOrderInfo.id,
          paymentId: lastPaymentIdRef.current,
        });
        // FETCH_ERROR 表示网络层失败（CORS preflight 拦截、瞬时断网等），
        // 属于基础设施/环境问题，非代码 bug，不应以 fatal 级别上报。
        const isFetchError = (e as any)?.status === 'FETCH_ERROR';
        captureStructuredError(e, {
          domain: BUSINESS_DOMAIN.PAYMENT,
          ...(isFetchError && { severity: 'error' }),
          extra: {
            step: 'buildOrderAndInitiate.deleteOrderPayment',
            orderId: currentOrderInfo.id,
            paymentMethod: activeProvider,
          },
        });
        handlePaymentError(
          { status: 'error', failureCode, errorMessage: errorMessage ?? 'internal deleteOrderPayment error' },
          { orderNumber: currentOrderInfo.number }
        );
        return null;
      }
    }

    // ── Step 3: Initiate payment intent ──────────────────────────────────────
    addBreadcrumb({
      message: 'initiatePayment start',
      domain: BUSINESS_DOMAIN.PAYMENT,
      data: { orderId: currentOrderInfo.id, activeProvider },
    });
    const initiateResult = await initiatePaymentAction({
      orderId: currentOrderInfo.id,
      orderNumber: currentOrderInfo.number,
      referenceNumber: currentOrderInfo.referenceNumber,
      amount: paymentAmount.toString(),
      currency: MarketCurrency,
      paymentConfig: { provider: activeProvider! },
      traceId: traceIdRef.current ?? undefined,
    });

    if (!initiateResult.success) {
      if (initiateResult.paymentId) lastPaymentIdRef.current = initiateResult.paymentId;
      logger.error('[buildOrderAndInitiate] initiatePaymentAction failed', {
        errorCode: initiateResult.errorCode,
        errorMessage: initiateResult.errorMessage,
        orderId: currentOrderInfo.id,
        activeProvider,
      });
      captureStructuredError(new Error(initiateResult.errorMessage ?? 'initiatePaymentAction failed'), {
        domain: BUSINESS_DOMAIN.PAYMENT,
        extra: {
          step: 'buildOrderAndInitiate.initiatePayment',
          orderId: currentOrderInfo.id,
          paymentMethod: activeProvider,
          errorMessage: initiateResult.errorMessage,
          failureCode: initiateResult.errorCode,
        },
      });
      handlePaymentError(
        { status: 'error', failureCode: initiateResult.errorCode, errorMessage: initiateResult.errorMessage },
        { orderNumber: currentOrderInfo.number }
      );
      return null;
    }

    addBreadcrumb({
      message: 'initiatePayment success',
      domain: BUSINESS_DOMAIN.PAYMENT,
      data: { orderId: currentOrderInfo.id, action: initiateResult.action?.action },
    });
    lastPaymentIdRef.current = initiateResult.paymentId;
    return initiateResult;
  }, [
    activeProvider,
    buildClientContext,
    orderInfo,
    paymentAmount,
    setPaymentError,
    handlePaymentError,
    paymentErrorMessages,
    persistenceHandles,
    createOrder,
    saveNewOrder,
    deleteOrderPayment,
    updatePaymentState,
    lastPaymentIdRef,
  ]);

  /**
   * Core payment pipeline for custom-submit-button providers: Stripe, GrabPay, 2C2P, Express.
   * For SDK_POPUP providers (PayPal / Affirm), use prepareSdkPayment instead.
   * Caller is responsible for running elements.submit() BEFORE calling this (Stripe only).
   */
  const runPaymentPipeline = useCallback(
    async ({
      confirmHandler,
      reuseCurrentAttempt = false,
    }: {
      confirmHandler?: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>;
      reuseCurrentAttempt?: boolean;
    }): Promise<{ status: 'success' | 'error'; errorMessage?: string }> => {
      if (!activeProvider) {
        setPaymentError({ message: paymentErrorMessages.providerNotSelected, displayType: 'inline' });
        return { status: 'error', errorMessage: paymentErrorMessages.providerNotSelected };
      }

      // Stripe Link Pay is not supported by the backend, so we need to transform it to Stripe Online
      const transformedActiveProvider =
        activeProvider === PaymentMethodProviderEnum.STRIPE_LINK_PAY
          ? PaymentMethodProviderEnum.STRIPE_ONLINE
          : activeProvider;
      if (!reuseCurrentAttempt) {
        startPaymentAttempt();
      }

      const initiateResult = await buildOrderAndInitiate();
      if (!initiateResult) return { status: 'error' };

      // ── Step 4: Execute SDK action or redirect ────────────────────────────
      const { action } = initiateResult;
      const returnUrl = `${window.location.origin}${checkoutSuccessPath}?orderId=${initiateResult.orderId}`;

      if (action.action === 'SDK_CONFIRM') {
        trackTransactionStart(
          buildClientContext('payment_sdk_confirm', {
            traceId: initiateResult.traceId,
            orderId: initiateResult.orderId,
            orderNumber: initiateResult.orderNumber,
            paymentId: initiateResult.paymentId,
            actionType: TransactionActionType.SDK_CONFIRM,
          }),
          {
            message: 'transaction.payment.payment_sdk_confirm.started',
            skipSentry: true,
          }
        );
        if (!confirmHandler) {
          setPaymentError({ message: paymentErrorMessages.stripeHandlerNotInitialized, displayType: 'inline' });
          return { status: 'error', errorMessage: paymentErrorMessages.stripeHandlerNotInitialized };
        }
        addBreadcrumb({
          message: 'SDK_CONFIRM start',
          domain: BUSINESS_DOMAIN.PAYMENT,
          data: { orderId: initiateResult.orderId, activeProvider },
        });
        const sdkResult = await confirmHandler(action.clientSecret, returnUrl);
        if (sdkResult !== true) {
          const error = sdkResult as IPaymentProcessingError;
          trackTransactionFailure(
            buildClientContext('payment_sdk_confirm', {
              traceId: initiateResult.traceId,
              orderId: initiateResult.orderId,
              orderNumber: initiateResult.orderNumber,
              paymentId: initiateResult.paymentId,
              actionType: TransactionActionType.SDK_CONFIRM,
              errorCode: error.code,
              errorCategory: TransactionErrorCategory.PROVIDER_ERROR,
              errorMessage: error.message,
            }),
            {
              message: 'transaction.payment.payment_sdk_confirm.failure',
              skipSentry: true,
            }
          );
          handlePaymentError(
            { status: 'error', failureCode: error.code, errorMessage: error.message },
            { orderNumber: initiateResult.orderNumber }
          );
          return { status: 'error', errorMessage: error.message };
        }
        trackTransactionSuccess(
          buildClientContext('payment_sdk_confirm', {
            traceId: initiateResult.traceId,
            orderId: initiateResult.orderId,
            orderNumber: initiateResult.orderNumber,
            paymentId: initiateResult.paymentId,
            actionType: TransactionActionType.SDK_CONFIRM,
          }),
          {
            message: 'transaction.payment.payment_sdk_confirm.success',
            skipSentry: true,
          }
        );
      } else if (action.action === 'REDIRECT') {
        trackTransactionSuccess(
          buildClientContext('payment_redirect', {
            traceId: initiateResult.traceId,
            orderId: initiateResult.orderId,
            orderNumber: initiateResult.orderNumber,
            paymentId: initiateResult.paymentId,
            actionType: TransactionActionType.REDIRECT,
            isRedirectFlow: true,
          }),
          {
            message: 'transaction.payment.payment_redirect.success',
            skipSentry: true,
          }
        );
        window.location.href = action.redirectUrl;
        return { status: 'success' };
      } else if (action.action === 'SDK_POPUP') {
        // SDK_POPUP must be handled by prepareSdkPayment, not this pipeline
        trackTransactionFailure(
          buildClientContext('payment_popup', {
            traceId: initiateResult.traceId,
            orderId: initiateResult.orderId,
            orderNumber: initiateResult.orderNumber,
            paymentId: initiateResult.paymentId,
            actionType: TransactionActionType.SDK_POPUP,
            errorCode: 'INTEGRATION_ERROR',
            errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
            errorMessage: `Unexpected SDK_POPUP action for provider ${transformedActiveProvider}`,
          }),
          {
            message: 'transaction.payment.payment_popup.failure',
            skipSentry: true,
          }
        );
        handlePaymentError(
          {
            status: 'error',
            failureCode: 'INTEGRATION_ERROR',
            errorMessage: `Unexpected SDK_POPUP action for provider ${transformedActiveProvider}`,
          },
          { orderNumber: initiateResult.orderNumber }
        );
        return { status: 'error' };
      }
      // action === 'SUCCESS' falls through to capture

      // ── Step 5: Capture — close the payment loop ──────────────────────────
      const captureResult = await captureWithRetry({
        orderId: initiateResult.orderId,
        orderNumber: initiateResult.orderNumber,
        paymentId: initiateResult.paymentId,
        provider: transformedActiveProvider,
        amount: paymentAmount.toString(),
        traceId: initiateResult.traceId,
      });

      if (!captureResult.success) {
        handlePaymentError(
          { status: 'error', failureCode: captureResult.errorCode, errorMessage: captureResult.errorMessage },
          { orderNumber: initiateResult.orderNumber }
        );
        return { status: 'error', errorMessage: captureResult.errorMessage };
      }

      dispatch(webPaymentCapturedEvent({ value: paymentAmount.toString() }));
      lastPaymentIdRef.current = null;
      updatePaymentState({ isProcessing: false });
      window.location.href = `${window.location.origin}${checkoutSuccessPath}?orderId=${initiateResult.orderId}`;
      return { status: 'success' };
    },
    [
      activeProvider,
      buildClientContext,
      startPaymentAttempt,
      paymentAmount,
      updatePaymentState,
      setPaymentError,
      handlePaymentError,
      paymentErrorMessages,
      buildOrderAndInitiate,
      lastPaymentIdRef,
      dispatch,
    ]
  );

  const handleCaptureResult = useCallback(
    async (captureResult: Awaited<ReturnType<typeof captureWithRetry>>, orderNumber: string) => {
      if (!captureResult.success) {
        handlePaymentError(
          { status: 'error', failureCode: captureResult.errorCode, errorMessage: captureResult.errorMessage },
          { orderNumber }
        );
        return;
      }
      dispatch(webPaymentCapturedEvent({ value: paymentAmount.toString() }));
      lastPaymentIdRef.current = null;
      updatePaymentState({ isProcessing: false });
      window.location.href = `${window.location.origin}${checkoutSuccessPath}?orderId=${captureResult.orderId}`;
    },
    [handlePaymentError, updatePaymentState, lastPaymentIdRef, dispatch, paymentAmount]
  );

  /**
   * Shared pre-capture pipeline for SDK_POPUP providers (PayPal / Affirm).

   * Handles TAU check, order creation, stale payment cleanup, and initiate.
   * Returns the initiate result if action is SDK_POPUP, otherwise null.
   */
  const prepareSdkPayment = useCallback(async (): Promise<SdkInitiateResult | null> => {
    if (!tauCheckHandler()) return null;
    if (!activeProvider) {
      setPaymentError({ message: paymentErrorMessages.providerNotSelected, displayType: 'inline' });
      return null;
    }

    startPaymentAttempt();
    updatePaymentState({ error: null, isProcessing: true });

    const initiateResult = await buildOrderAndInitiate();
    if (!initiateResult) return null;

    const { action } = initiateResult;
    if (action.action !== 'SDK_POPUP') {
      handlePaymentError(
        { status: 'error', failureCode: 'INTEGRATION_ERROR', errorMessage: `Unexpected action: ${action.action}` },
        { orderNumber: initiateResult.orderNumber }
      );
      return null;
    }

    return {
      sdkToken: action.sdkToken,
      paymentId: initiateResult.paymentId,
      traceId: initiateResult.traceId,
      orderId: initiateResult.orderId,
      orderNumber: initiateResult.orderNumber,
    };
  }, [
    tauCheckHandler,
    activeProvider,
    setPaymentError,
    paymentErrorMessages,
    updatePaymentState,
    buildOrderAndInitiate,
    buildClientContext,
    startPaymentAttempt,
    handlePaymentError,
  ]);

  // ─── Payment-method-specific submit handlers ──────────────────────────────

  const onStripeCardSubmit = useCallback(
    async (e?: any) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      const submitHandler = stripeSubmitHandlerRef.current;
      const confirmHandler = stripeConfirmHandlerRef.current;

      if (!submitHandler || !confirmHandler) {
        setPaymentError({ message: paymentErrorMessages.stripeHandlerNotInitialized, displayType: 'inline' });
        return;
      }
      if (!tauCheckHandler()) return;

      updatePaymentState({ error: null, isProcessing: true });
      startPaymentAttempt();

      // Client-side form validation must run before the Server Action
      trackTransactionStart(
        buildClientContext('payment_sdk_ready', {
          actionType: TransactionActionType.SDK_CONFIRM,
        }),
        {
          message: 'transaction.payment.payment_sdk_ready.started',
          skipSentry: true,
        }
      );
      const submitResult = await submitHandler();
      if (submitResult !== true) {
        const error = submitResult as IPaymentProcessingError;
        trackTransactionFailure(
          buildClientContext('payment_sdk_ready', {
            actionType: TransactionActionType.SDK_CONFIRM,
            errorCode: error.code,
            errorCategory: TransactionErrorCategory.VALIDATION_ERROR,
            errorMessage: error.message,
          }),
          {
            message: 'transaction.payment.payment_sdk_ready.failure',
            skipSentry: true,
          }
        );
        handlePaymentError(
          { status: 'error', failureCode: error.code, errorMessage: error.message },
          { orderNumber: orderInfo?.number ?? '' }
        );
        return;
      }
      trackTransactionSuccess(
        buildClientContext('payment_sdk_ready', {
          actionType: TransactionActionType.SDK_CONFIRM,
        }),
        {
          message: 'transaction.payment.payment_sdk_ready.success',
          skipSentry: true,
        }
      );

      try {
        await runPaymentPipeline({ confirmHandler, reuseCurrentAttempt: true });
      } catch (e) {
        const err = e as Error;
        captureTransactionError(
          err,
          buildClientContext('payment_sdk_confirm', {
            errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
            errorMessage: err.message || String(err),
          }),
          {
            message: 'transaction.payment.payment_sdk_confirm.exception',
          }
        );
        handlePaymentError(
          { status: 'error', failureCode: 'UNEXPECTED_ERROR', errorMessage: err.message || String(err) },
          { orderNumber: orderInfo?.number ?? '' }
        );
      }
    },
    [
      tauCheckHandler,
      orderInfo,
      updatePaymentState,
      startPaymentAttempt,
      setPaymentError,
      handlePaymentError,
      paymentErrorMessages,
      runPaymentPipeline,
      buildClientContext,
    ]
  );

  /**
   * GrabPay is a redirect flow: initiate → REDIRECT → user pays on GrabPay page
   * → callback route handles capture (T3, not yet implemented).
   */
  const onGrabPaySubmit = useCallback(async () => {
    if (!tauCheckHandler()) return;
    updatePaymentState({ error: null, isProcessing: true });
    await runPaymentPipeline({});
  }, [tauCheckHandler, updatePaymentState, runPaymentPipeline]);

  /**
   * 2C2P is an SDK_CONFIRM flow: initiate → SDK_CONFIRM (paymentToken as clientSecret)
   * → FE calls 2C2P SDK → capturePaymentAction.
   * TODO: expose onGetTwoCTwoPConfirmHandler from TcTpPaymentElement and wire it here.
   */
  const onTwoCTwoPSubmit = useCallback(async () => {
    if (!tauCheckHandler()) return;
    updatePaymentState({ error: null, isProcessing: true });
    await runPaymentPipeline({ confirmHandler: twoCTwoPConfirmHandlerRef.current ?? undefined });
  }, [tauCheckHandler, updatePaymentState, runPaymentPipeline]);

  const onExpressCheckoutSubmit = useCallback(
    async ({
      submitHandler,
      confirmHandler,
    }: {
      submitHandler?: () => Promise<boolean | IPaymentProcessingError>;
      confirmHandler?: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>;
    }) => {
      updatePaymentState({ error: null, isProcessing: true });

      if (submitHandler) {
        const submitResult = await submitHandler();
        if (submitResult !== true) {
          const error = submitResult as IPaymentProcessingError;
          setPaymentError({
            message: error.message || paymentErrorMessages.paymentValidationFailed,
            displayType: 'inline',
          });
          return { status: 'error' as const, errorMessage: error.message };
        }
      }

      return runPaymentPipeline({ confirmHandler });
    },
    [updatePaymentState, setPaymentError, paymentErrorMessages, runPaymentPipeline]
  );

  const onPaypalCapture = useCallback(
    async (params: SdkInitiateResult & { paypalOrderId: string; payerId?: string }) => {
      const captureResult = await captureWithRetry({
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        paymentId: params.paymentId,
        provider: activeProvider!,
        amount: paymentAmount.toString(),
        traceId: params.traceId,
        paypalData: { orderId: params.paypalOrderId, payerId: params.payerId },
      });
      await handleCaptureResult(captureResult, params.orderNumber);
    },
    [activeProvider, paymentAmount, handleCaptureResult]
  );

  const onAffirmCapture = useCallback(
    async (params: SdkInitiateResult & { checkoutToken: string }) => {
      const captureResult = await captureWithRetry({
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        paymentId: params.paymentId,
        provider: activeProvider!,
        amount: paymentAmount.toString(),
        traceId: params.traceId,
        affirmData: { checkoutId: params.checkoutToken, checkoutToken: params.checkoutToken },
      });
      await handleCaptureResult(captureResult, params.orderNumber);
    },
    [activeProvider, paymentAmount, handleCaptureResult]
  );

  const onSdkError = useCallback(
    (error: { failureCode?: string; errorMessage: string; failureInfo?: string }) => {
      handlePaymentError(
        {
          status: 'error',
          failureCode: error.failureCode,
          errorMessage: error.errorMessage,
          failureInfo: error.failureInfo,
        },
        { orderNumber: orderInfo?.number ?? '' }
      );
    },
    [handlePaymentError, orderInfo]
  );

  return {
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
  };
}
