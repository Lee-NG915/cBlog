'use client';
import { useMemo, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { logger } from '@castlery/observability';
import { PaymentElementForm } from './payment-element-form';
import { MarketCurrency } from '@castlery/config';
import { IPaymentProcessingError } from '../../payment-wallets/types';

interface StripePaymentElementProps {
  methodSettings: {
    publicKey: string;
  };
  paymentInfo: {
    amount: number;
    billingAddress: Record<string, string | number> | null;
  };
  onFormChange: (paymentMethodType: string, complete: boolean) => void;
  onGetStripeSubmitHandler: (handler: () => Promise<boolean | IPaymentProcessingError>) => void;
  onGetStripeConfirmHandler: (
    handler: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>
  ) => void;
  onStripeLoadingChange?: (isLoading: boolean) => void;
}

/**
 * Stripe Payment Element — deferred payment flow.
 * - Integration: https://docs.stripe.com/payments/accept-a-payment?payment-ui=elements
 * - API reference: https://docs.stripe.com/js/elements_object/create_payment_element
 * - Style guide: https://docs.stripe.com/payments/payment-element#appearance
 * - Layout options: https://docs.stripe.com/payments/payment-element#layout
 * - Deferred example: https://docs.stripe.com/payments/accept-a-payment-deferred?type=payment
 * - Error codes: https://docs.stripe.com/error-codes
 */
export function StripePaymentElement({
  methodSettings,
  paymentInfo,
  onFormChange,
  onGetStripeSubmitHandler,
  onGetStripeConfirmHandler,
  onStripeLoadingChange,
}: StripePaymentElementProps) {
  const { publicKey } = methodSettings;
  const { amount } = paymentInfo;

  const stripePromise = useMemo(() => loadStripe(publicKey), [publicKey]);

  // Stripe requires amounts in the currency's smallest unit (e.g. cents for CAD/USD/SGD/AUD/GBP)
  const amountInSmallestUnit = useMemo(() => Math.round(amount * 100), [amount]);

  useEffect(() => {
    if (!amount || amountInSmallestUnit <= 0) {
      logger.error('Invalid amount for Stripe payment', { amount, amountInSmallestUnit });
    }
  }, [amount, amountInSmallestUnit]);

  const elementsOptions: StripeElementsOptions = useMemo(
    () => ({
      mode: 'payment',
      amount: amountInSmallestUnit,
      currency: MarketCurrency.toLowerCase(),
      appearance: {
        variables: {
          colorPrimary: '#212121',
          colorBackground: '#F6F3E7',
          colorText: '#212121',
          colorDanger: '#65000B',
          fontFamily: 'Aime',
          spacingUnit: '4px',
          borderRadius: '0px',
        },
        rules: {
          '.Label': { fontFamily: 'Aime' },
          '.AccordionItem': {
            border: 'none',
            boxShadow: 'none',
            paddingLeft: 0,
          },
          '.Input': {
            backgroundColor: '#F6F3E7',
            border: '1px solid #212121',
          },
          '.Input[data-elements-stable-field-name="email"]': {
            backgroundColor: '#F6F3E7',
          },
          '.Input[data-elements-stable-field-name="oneTimeCode"]': {
            backgroundColor: '#F6F3E7',
          },
          '.Button--primary': {
            backgroundColor: '#212121',
            borderRadius: '0px',
          },
          '.Button--primary:hover': {
            backgroundColor: '#3a3a3a',
          },
          '[data-testid="cookied-payment-details-widget"]': {
            backgroundColor: '#F6F3E7',
            border: '1px solid #d4d0c4',
            borderRadius: '0px',
            padding: '12px',
            marginTop: '8px',
          },
          '#link-branded-root .FadeWrapper': {
            opacity: '1',
            transition: 'all 0.2s ease',
          },
        },
      },
    }),
    [amountInSmallestUnit]
  );

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentElementForm
        billingAddress={paymentInfo.billingAddress}
        onFormChange={onFormChange}
        onGetStripeSubmitHandler={onGetStripeSubmitHandler}
        onGetStripeConfirmHandler={onGetStripeConfirmHandler}
        onStripeLoadingChange={onStripeLoadingChange}
      />
    </Elements>
  );
}
