'use client';

import { useAppSelector } from '@castlery/shared-redux-store';
import {
  selectCheckoutRoot,
  selectHasCheckoutRoot,
  selectFetchCheckoutDataLoading,
  selectCheckoutDataSource,
  selectCheckoutGiftLineItems,
} from '@castlery/modules-checkout-domain';
import { useMemo } from 'react';

/**
 * Hook to get payment data source from the unified checkout info structure.
 *
 * Both "checkout session" (getCheckoutInfo) and "order checkout" (getOrderCheckoutDetail)
 * share the same CheckoutSessionInfoSchema structure and are stored in checkoutRoot.
 * The `source` field records which API populated the data.
 *
 * Priority / source values:
 *   - 'orderCheckout'   — data loaded via getOrderCheckoutDetail (pre-created order flow)
 *   - 'checkoutSession' — data loaded via getCheckoutInfo (normal checkout flow)
 *   - 'none'            — no data available yet (loading or error)
 */
export const useGetPaymentDataSource = () => {
  const fetchCheckoutDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const hasCheckoutRoot = useAppSelector(selectHasCheckoutRoot);
  const checkoutRoot = useAppSelector(selectCheckoutRoot);
  const checkoutDataSource = useAppSelector(selectCheckoutDataSource);
  const checkoutGiftLineItems = useAppSelector(selectCheckoutGiftLineItems);
  const items = useMemo(
    () => [...(checkoutRoot?.lineItems || []), ...(checkoutGiftLineItems || [])],
    [checkoutGiftLineItems, checkoutRoot?.lineItems]
  );

  return useMemo(() => {
    if (hasCheckoutRoot && checkoutRoot) {
      return {
        source: (checkoutDataSource ?? 'checkoutSession') as 'orderCheckout' | 'checkoutSession',
        loading: false,
        shippingAddress: checkoutRoot.addressInfo,
        billingAddress: checkoutRoot.billAddress,
        summary: checkoutRoot.summary,
        lineItems: items,
        checkoutInfo: checkoutRoot,
      };
    }

    return {
      source: 'none' as const,
      loading: fetchCheckoutDataLoading,
      shippingAddress: null,
      billingAddress: null,
      summary: null,
      lineItems: [],
      checkoutInfo: null,
    };
  }, [hasCheckoutRoot, checkoutRoot, checkoutDataSource, fetchCheckoutDataLoading]);
};
