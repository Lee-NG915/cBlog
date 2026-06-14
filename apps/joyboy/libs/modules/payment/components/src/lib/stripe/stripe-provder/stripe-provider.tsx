'use client';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider } from '@stripe/react-stripe-js';

export interface StripeProviderProps {
  stripePublicKey: string;
  children: React.ReactNode;
}
export function StripeProvider({ stripePublicKey, children }: StripeProviderProps) {
  const stripePromise = loadStripe(stripePublicKey);

  if (!stripePromise) {
    throw new Error('Stripe public key is required');
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: async (): Promise<string> => {
          // TODO: 获取 client secret, 等待接口完成
          return Promise.resolve('123');
        },
        elementsOptions: {
          appearance: {
            theme: 'stripe',
            variables: {},
          },
        },
      }}
    >
      {children}
    </CheckoutProvider>
  );
}
