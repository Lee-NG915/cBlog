'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

/**
 * Returns true when an order is considered "created" for the current context, so that
 * Back button and address/shipping steps can be disabled.
 *
 * Two scenarios:
 * - Scenario 1 (checkout flow → order created): orderId is in persistence and
 *   webTransactionSymbol matches `${checkoutToken}-${orderIdInPersistence}` (same session).
 * - Scenario 2 (order list → payment): user entered payment from order list; orderId
 *   is in URL search params. No checkoutToken validation needed.
 */
export function useHasOrderCreated(): boolean {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  return useMemo(() => {
    if (!pathname?.includes('/checkout/')) {
      return false;
    }
    // Scenario 2: from order list to payment — orderId in search params
    const orderIdInSearchParams = searchParams.get('orderId');
    if (orderIdInSearchParams?.trim()) {
      return true;
    }

    // Scenario 1: checkout flow → order created — validate symbol in persistence
    const persistenceHandles = makePersistenceHandles() as unknown as {
      webTransactionOrderId: { getItem(): string | null };
      xCheckoutSessionToken: { getItem(): string | null };
      webTransactionSymbol: { getItem(): string | null };
    };
    const orderIdInPersistence = persistenceHandles.webTransactionOrderId.getItem();
    const checkoutToken = persistenceHandles.xCheckoutSessionToken.getItem();
    const transactionSymbolInPersistence = persistenceHandles.webTransactionSymbol.getItem();
    if (!orderIdInPersistence?.trim()) {
      return false;
    }
    const symbol = `${checkoutToken}-${orderIdInPersistence}`;
    return transactionSymbolInPersistence === symbol;
  }, [searchParams, pathname]);
}
