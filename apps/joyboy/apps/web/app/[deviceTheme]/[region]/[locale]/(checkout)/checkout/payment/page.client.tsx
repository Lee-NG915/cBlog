'use client';
import { useLazyGetPaymentMethodConfigsQuery } from '@castlery/modules-payment-domain';
import {
  useLazyGetCheckoutInfoQuery,
  usePreInventoryReserveMutation,
  useGetOrderCheckoutDetailQuery,
} from '@castlery/modules-checkout-domain';
import { useLazyGetTransactionOrderPaymentsQuery } from '@castlery/modules-order-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { basePageConfig, EcEnv } from '@castlery/config';
import { TransactionDomain, TransactionResult, logger, reportTransactionMessage } from '@castlery/observability';
import { PaymentMainContent } from '@castlery/modules-composite-components';
import type { PaymentResumeSearchParams } from './page';

type ResumePaymentState = {
  status: 'failure' | 'processing';
  provider?: string;
  paymentId?: string;
  traceId?: string;
  errorCode?: string;
  orderNumber?: string;
};

const SUCCESS_PAYMENT_STATES = new Set(['PAYMENT_STATUS_PAID', 'PAYMENT_STATUS_CAPTURED', 'PAYMENT_STATUS_AUTHORIZED']);
const PROCESSING_PAYMENT_STATES = new Set(['PAYMENT_STATUS_PENDING', 'PAYMENT_STATUS_PROCESSING']);
const FAILURE_PAYMENT_STATES = new Set(['PAYMENT_STATUS_FAILED', 'PAYMENT_STATUS_CANCELED', 'PAYMENT_STATUS_EXPIRED']);
/**
 * CSR page for payment
 * @returns
 */
export function PaymentPageContent({
  orderId: orderIdInSearchParams,
  resumeParams,
}: {
  orderId?: string;
  resumeParams?: PaymentResumeSearchParams;
}) {
  const router = useRouter();
  const fetchedDataRef = useRef<boolean>(false);
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);
  // Persistence (sessionStorage/cookies) is only available on the client.
  // Gate persistence reads behind isClient so SSR + first CSR render are deterministic
  // and searchParams.orderId is the single source of truth on the server.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const orderIdInPersistence = useMemo(
    () => (isClient ? persistenceHandles.webTransactionOrderId.getItem() : ''),
    [persistenceHandles, isClient]
  );
  const checkoutToken = useMemo(
    () => (isClient ? persistenceHandles.xCheckoutSessionToken.getItem() : ''),
    [persistenceHandles, isClient]
  );
  const transactionSymbolInPersistence = useMemo(
    () => (isClient ? persistenceHandles.webTransactionSymbol.getItem() : ''),
    [persistenceHandles, isClient]
  );
  const [resumeState, setResumeState] = useState<ResumePaymentState | null>(() =>
    resumeParams?.paymentStatus
      ? {
          status: resumeParams.paymentStatus,
          provider: resumeParams.provider,
          paymentId: resumeParams.paymentId,
          traceId: resumeParams.traceId,
          errorCode: resumeParams.errorCode,
          orderNumber: resumeParams.orderNumber,
        }
      : null
  );

  // Valid order ID priority:
  // 1. searchParams.orderId — SSR-safe, highest priority (covers the "Pay from order history" flow
  //    where the URL carries the target orderId and must not be shadowed by a stale session orderId)
  // 2. persistence.webTransactionOrderId — CSR-only fallback, requires token symbol to match
  const validOrderId = useMemo(() => {
    if (orderIdInSearchParams) {
      return orderIdInSearchParams;
    }
    if (!isClient) {
      return '';
    }
    if (orderIdInPersistence) {
      const symbol = `${checkoutToken}-${orderIdInPersistence}`;
      if (transactionSymbolInPersistence === symbol) {
        return orderIdInPersistence;
      }
    }
    return '';
  }, [orderIdInSearchParams, orderIdInPersistence, transactionSymbolInPersistence, checkoutToken, isClient]);

  const shouldFetchTransactionOrder = useMemo(() => {
    return !!validOrderId;
  }, [validOrderId]);

  const shouldFetchCheckoutInfo = useMemo(() => {
    return checkoutToken && !validOrderId;
  }, [checkoutToken, validOrderId]);

  const [getPaymentMethodConfigsTrigger] = useLazyGetPaymentMethodConfigsQuery();
  const [getCheckoutInfoTrigger] = useLazyGetCheckoutInfoQuery();
  const [preInventoryReserveTrigger] = usePreInventoryReserveMutation();
  const [getOrderPaymentsTrigger] = useLazyGetTransactionOrderPaymentsQuery();

  const { fulfilledTimeStamp: orderDetailFulfilledTimeStamp } = useGetOrderCheckoutDetailQuery(validOrderId, {
    skip: !shouldFetchTransactionOrder,
    refetchOnMountOrArgChange: true,
  });

  // Fetch payment method configs after order detail is fetched
  useEffect(() => {
    if (orderDetailFulfilledTimeStamp) {
      getPaymentMethodConfigsTrigger();
    }
  }, [orderDetailFulfilledTimeStamp, getPaymentMethodConfigsTrigger]);

  const handleFetchData = useCallback(async () => {
    if (fetchedDataRef.current) return;
    // Order detail + payment configs are handled declaratively via useGetOrderCheckoutDetailQuery
    if (shouldFetchTransactionOrder) return;

    try {
      fetchedDataRef.current = true;

      // Priority 1: Fetch checkout info first to validate prerequisite steps
      // preInventoryReserve must only be called after confirming address and shipping method are set,
      // otherwise users who bypass the checkout flow would incorrectly reserve inventory.
      if (shouldFetchCheckoutInfo) {
        const checkoutData = await getCheckoutInfoTrigger({ noCache: true, needsShippingMethod: false }).unwrap();
        if (!checkoutData.addressInfo?.id || !persistenceHandles.shippingMethodStepConfirmed.hasItem()) {
          // Prerequisite steps incomplete — skip inventory reserve; wrapper handles redirect
          return;
        }
        await preInventoryReserveTrigger();
        await getPaymentMethodConfigsTrigger();
        return;
      }

      // No checkout info needed (no checkout token) — still reserve and fetch payment configs
      await preInventoryReserveTrigger();
      await getPaymentMethodConfigsTrigger();
    } catch (error) {
      logger.error('Failed to fetch payment data', { error });
      fetchedDataRef.current = false;
    }
  }, [
    shouldFetchTransactionOrder,
    shouldFetchCheckoutInfo,
    getCheckoutInfoTrigger,
    getPaymentMethodConfigsTrigger,
    persistenceHandles.shippingMethodStepConfirmed,
    preInventoryReserveTrigger,
  ]);

  // Fetch data when needed. Wait for isClient so persistence-derived flags
  // (checkoutToken, etc.) are populated before deciding the fetch branch.
  useEffect(() => {
    if (!isClient) return;
    handleFetchData();
  }, [handleFetchData, isClient]);

  useEffect(() => {
    if (!resumeParams?.paymentStatus || !validOrderId) return;

    getOrderPaymentsTrigger(validOrderId).then((result) => {
      const payments: any[] = Array.isArray(result.data?.payments) ? result.data.payments : [];
      const matchedPayment =
        payments.find((payment) => payment.paymentId === resumeParams.paymentId) ||
        payments.find((payment) => payment.provider === resumeParams.provider && !payment.isVoided) ||
        payments[0];

      const paymentState = matchedPayment?.paymentState as string | undefined;

      reportTransactionMessage(
        {
          domain: TransactionDomain.PAYMENT,
          step: 'payment_callback_receive',
          traceId: resumeParams.traceId,
          orderId: validOrderId,
          orderNumber: resumeParams.orderNumber,
          paymentId: resumeParams.paymentId,
          provider: resumeParams.provider,
          result:
            resumeParams.paymentStatus === 'processing' ? TransactionResult.PROCESSING : TransactionResult.FAILURE,
          errorCode: resumeParams.errorCode,
        },
        {
          message: 'transaction.payment.payment_callback_receive.resume',
          skipSentry: true,
        }
      );

      if (paymentState && SUCCESS_PAYMENT_STATES.has(paymentState)) {
        const prefix = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['checkout-success']}`;
        const target = new URL(prefix, window.location.origin);
        target.searchParams.set('orderId', validOrderId);
        if (resumeParams.orderNumber) target.searchParams.set('orderNumber', resumeParams.orderNumber);
        if (resumeParams.paymentId) target.searchParams.set('paymentId', resumeParams.paymentId);
        if (resumeParams.traceId) target.searchParams.set('traceId', resumeParams.traceId);
        if (resumeParams.provider) target.searchParams.set('provider', resumeParams.provider);

        router.replace(`${target.pathname}${target.search}`);
        return;
      }

      if (paymentState && PROCESSING_PAYMENT_STATES.has(paymentState)) {
        setResumeState((prev) =>
          prev
            ? {
                ...prev,
                status: 'processing',
              }
            : null
        );
        return;
      }

      if (paymentState && FAILURE_PAYMENT_STATES.has(paymentState)) {
        setResumeState((prev) =>
          prev
            ? {
                ...prev,
                status: 'failure',
              }
            : null
        );
      }
    });
  }, [getOrderPaymentsTrigger, resumeParams, router, validOrderId]);

  return (
    <PaymentMainContent
      key={validOrderId || 'checkout-session'}
      orderId={validOrderId ?? ''}
      resumeState={resumeState}
    />
  );
}
