'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLazyGetTransactionOrderPaymentsQuery } from '@castlery/modules-order-domain';
import type { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import type { useGetPaymentDataSource } from '@castlery/shared-components';
import { orderHistoryPath } from '../constants';

export type OrderInfo = {
  id: string;
  referenceNumber: string;
  number: string;
  paymentExpiredAt?: string;
};

/** Reads the checkout token from sessionStorage, normalising both string and {token} shapes. */
export function readCheckoutToken(handles: ReturnType<typeof makePersistenceHandles>): string | undefined {
  const raw =
    typeof handles?.xCheckoutSessionToken?.getItem === 'function' ? handles.xCheckoutSessionToken.getItem() : undefined;
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'token' in raw) return String((raw as { token: unknown }).token);
  return undefined;
}

export function useOrderLifecycle({
  orderId,
  paymentDataSource,
  persistenceHandles,
}: {
  orderId: string;
  paymentDataSource: ReturnType<typeof useGetPaymentDataSource>;
  persistenceHandles: ReturnType<typeof makePersistenceHandles>;
}) {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(() => {
    if (!orderId || paymentDataSource.source !== 'orderCheckout') return null;
    const info = paymentDataSource.checkoutInfo as any;
    return info?.id
      ? {
          id: info.id,
          referenceNumber: info.referenceNumber ?? '',
          number: info.number ?? '',
          paymentExpiredAt: info.paymentExpiredAt,
        }
      : null;
  });

  // null = not yet checked; true = no payments or has PENDING; false = has non-PENDING (redirect will happen)
  const [orderPaymentsHasPending, setOrderPaymentsHasPending] = useState<boolean | null>(null);

  const router = useRouter();
  const lastPaymentIdRef = useRef<string | null>(null);
  const [getOrderPayments] = useLazyGetTransactionOrderPaymentsQuery();

  // Sync when checkout info resolves asynchronously or is refetched for another order.
  const checkoutInfo = paymentDataSource.checkoutInfo as any;
  const checkoutInfoId = checkoutInfo?.id;
  const checkoutInfoReferenceNumber = checkoutInfo?.referenceNumber ?? '';
  const checkoutInfoNumber = checkoutInfo?.number ?? '';
  const checkoutInfoPaymentExpiredAt = checkoutInfo?.paymentExpiredAt;

  useEffect(() => {
    if (paymentDataSource.source !== 'orderCheckout' || !checkoutInfoId) {
      setOrderInfo((prev) => (prev ? null : prev));
      setOrderPaymentsHasPending(null);
      lastPaymentIdRef.current = null;
      return;
    }

    if (orderInfo?.id !== checkoutInfoId) {
      setOrderPaymentsHasPending(null);
      lastPaymentIdRef.current = null;
    }

    setOrderInfo((prev) => {
      if (
        prev?.id === checkoutInfoId &&
        prev.referenceNumber === checkoutInfoReferenceNumber &&
        prev.number === checkoutInfoNumber &&
        prev.paymentExpiredAt === checkoutInfoPaymentExpiredAt
      ) {
        return prev;
      }

      return {
        id: checkoutInfoId,
        referenceNumber: checkoutInfoReferenceNumber,
        number: checkoutInfoNumber,
        paymentExpiredAt: checkoutInfoPaymentExpiredAt,
      };
    });
  }, [
    paymentDataSource.source,
    checkoutInfoId,
    checkoutInfoReferenceNumber,
    checkoutInfoNumber,
    checkoutInfoPaymentExpiredAt,
    orderInfo?.id,
  ]);

  // On mount / refresh / browser-back: check existing payments for this order.
  // - Empty payments → stay (fresh order, no attempt yet)
  // - Any non-voided PENDING payment → stay and register it as the residual for cleanup
  // - No non-voided PENDING payment → redirect to order history
  useEffect(() => {
    if (!orderInfo?.id || paymentDataSource.source !== 'orderCheckout') return;

    getOrderPayments(orderInfo.id).then((result) => {
      if (!result.data) return;
      const payments: any[] = Array.isArray(result.data.payments) ? result.data.payments : [];

      if (payments.length === 0) {
        setOrderPaymentsHasPending(true);
        return;
      }

      const pendingPayment = payments.find(
        (p) =>
          (p.paymentState === 'PAYMENT_STATUS_PENDING' || p.paymentState === 'PAYMENT_STATUS_PROCESSING') && !p.isVoided
      );
      if (pendingPayment) {
        lastPaymentIdRef.current = pendingPayment.paymentId;
        setOrderPaymentsHasPending(true);
        return;
      }

      setOrderPaymentsHasPending(false);
      router.replace(orderHistoryPath);
    });
  }, [orderInfo?.id, paymentDataSource.source, getOrderPayments, router]);

  // Writes the newly-created order into React state and sessionStorage so that
  // page refreshes and re-entries skip order creation.
  const saveNewOrder = useCallback(
    (info: OrderInfo, checkoutToken: string) => {
      setOrderInfo(info);
      persistenceHandles.webTransactionOrderId.setItem(info.id);
      persistenceHandles.webTransactionSymbol.setItem(`${checkoutToken}-${info.id}`);
    },
    [persistenceHandles]
  );

  return { orderInfo, orderPaymentsHasPending, lastPaymentIdRef, saveNewOrder };
}
