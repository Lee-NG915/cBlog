'use client';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, type StripeCheckoutOptions } from '@stripe/stripe-js';
import { useMemo } from 'react';

// 保证只加载一次stripe
let stripePromise: Promise<Stripe | null>;
/**
 * StripeProvider is a component that provides a Stripe instance to its children.
 * @see ui https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-components
 * @see docs https://docs.stripe.com/js/custom_checkout/react/checkout_provider
 * @param param0
 * @returns
 */
export function StripeProvider({
  stripePublicKey,
  amount,
  children,
}: {
  stripePublicKey: string;
  amount: number;
  children: React.ReactNode;
}) {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }

  const fetchClientSecret = async (): Promise<string> => {
    //获取clientSecret, 等待后端接口开发完成
    // 1. 提交订单的一些信息给BE，从而获取clientSecret
    // 2. 使用useCheckout，进行提交， 详见stripe-submit-button

    return '';
  };

  const options = useMemo(() => {
    return {
      //获取clientSecret, 等待后端接口开发完成
      fetchClientSecret: fetchClientSecret,
      elementsOptions: {
        appearance: {
          theme: 'stripe',
          variables: {},
        },
      },
    } as StripeCheckoutOptions;
  }, [amount]);

  if (!stripePromise) {
    return null;
  }

  return (
    <CheckoutProvider stripe={stripePromise} options={options}>
      {children}
    </CheckoutProvider>
  );
}

export type StripeProviderProps = Parameters<typeof StripeProvider>[0];
