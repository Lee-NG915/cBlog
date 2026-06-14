'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { basePageConfig, EcEnv } from '@castlery/config';

const orderHistoryPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase() + basePageConfig['orders'];

export type CheckoutSuccessParams = {
  orderId: string;
  token: string;
};

/**
 * Captures `orderId` / `token` from the URL on mount and then:
 * - strips `orderId` from the address bar when no `token` is present (non-SPL flow)
 *   so that a refresh leaves nothing to resume → user gets redirected to the
 *   order history page
 * - leaves the URL untouched when a `token` is present (SPL unauthenticated
 *   flow) so that a refresh can still resolve the order via the token
 * - redirects to the order history page when neither value is present on mount
 *   (the page was opened directly or refreshed after the URL was stripped)
 *
 * `history.replaceState` is used on purpose: it bypasses Next.js router events,
 * so `useSearchParams` does not re-render and downstream queries keep their
 * captured values.
 */
export const useCheckoutSuccessParams = (): CheckoutSuccessParams => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params] = useState<CheckoutSuccessParams>(() => ({
    orderId: searchParams.get('orderId') || '',
    token: searchParams.get('token') || '',
  }));

  useEffect(() => {
    if (!params.orderId && !params.token) {
      router.replace(orderHistoryPath);
      return;
    }

    if (params.token || !params.orderId || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has('orderId')) return;

    url.searchParams.delete('orderId');
    window.history.replaceState(null, '', url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return params;
};
