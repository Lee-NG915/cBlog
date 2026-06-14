'use client';
import { PayPalScriptProvider, type ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { useMemo } from 'react';

export function PaypalProvider({
  paypalPublicKey,
  currency,
  children,
}: {
  paypalPublicKey: string;
  currency: string;
  children: React.ReactNode;
}) {
  console.log('paypalPublicKey provider', paypalPublicKey);

  const options = useMemo(() => {
    if (!paypalPublicKey) {
      return null;
    }
    return {
      clientId: paypalPublicKey,
      currency,
    } as ReactPayPalScriptOptions;
  }, [paypalPublicKey, currency]);

  if (!options) {
    return null;
  }

  return <PayPalScriptProvider options={options}>{children}</PayPalScriptProvider>;
}

export type PaypalProviderProps = Parameters<typeof PaypalProvider>[0];
