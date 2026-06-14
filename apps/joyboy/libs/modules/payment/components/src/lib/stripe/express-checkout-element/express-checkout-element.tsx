'use client';
import { StripeExpressCheckoutElementConfirmEvent, StripeExpressCheckoutElementOptions } from '@stripe/stripe-js';
import { StripeElementProvider } from '../stripe-element-provider/stripe-element-provider';
import { useMemo } from 'react';
import { ExpressElement, type AvailableStripeExpressPaymentMethods } from './express-element';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import type { IPaymentProcessingError } from '../../payment-wallets/types';

export { type AvailableStripeExpressPaymentMethods } from './express-element';
export type ExpressCheckoutElementConfirmEvent = StripeExpressCheckoutElementConfirmEvent;

const ALLOWED_EXPRESS_PAYMENT_PROVIDERS: readonly PaymentMethodProviderEnum[] = [
  PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
  PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
  PaymentMethodProviderEnum.STRIPE_LINK_PAY,
];

/**
 * 使用stripe express-checkout-element 实现express checkout 支付方式, express element + payment intent api
 * @docs https://docs.stripe.com/elements/express-checkout-element/accept-a-payment?payment-ui=elements#submit-the-payment
 * @param selectedPaymentKey 当前选中的支付方式
 * @param Selector 选择器，用于显示支付方式的标题和图标
 * @returns
 */
export function ExpressCheckoutElement({
  activePaymentProvider,
  stripePublicKey,
  amount,
  onGetAvailablePaymentMethods,
  placeOrderHandler,
  prepareCheckHandler,
  onError,
}: {
  activePaymentProvider: PaymentMethodProviderEnum;
  stripePublicKey: string;
  amount: number;
  onGetAvailablePaymentMethods: (availablePaymentMethods: AvailableStripeExpressPaymentMethods) => void;
  placeOrderHandler: ({
    submitHandler,
    confirmHandler,
  }: {
    submitHandler?: () => Promise<boolean | IPaymentProcessingError>;
    confirmHandler?: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>;
  }) => Promise<{
    status: 'success' | 'error';
    errorMessage?: string;
    paymentId?: string;
    provider?: string;
    clientSecret?: string;
  }>;
  prepareCheckHandler: () => boolean;
  onError?: (errorMessage: string) => void;
}) {
  const extraOptions = useMemo(() => {
    // Google Pay 和 Apple Pay 使用 'card' payment method type
    // stripe-element-provider 中已经设置了 paymentMethodTypes: ['card']
    // 这里不需要额外配置
    return {};
  }, []);

  const extraElementOptions: Partial<StripeExpressCheckoutElementOptions> = useMemo(() => {
    if (ALLOWED_EXPRESS_PAYMENT_PROVIDERS.includes(activePaymentProvider)) {
      if (activePaymentProvider === PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY) {
        return {
          paymentMethods: {
            googlePay: 'always',
            applePay: 'never',
            link: 'never',
          },
        };
      }
      if (activePaymentProvider === PaymentMethodProviderEnum.STRIPE_APPLE_PAY) {
        return {
          paymentMethods: {
            applePay: 'always',
            googlePay: 'never',
            link: 'never',
          },
        };
      }
      if (activePaymentProvider === PaymentMethodProviderEnum.STRIPE_LINK_PAY) {
        return {
          paymentMethods: {
            link: 'auto',
            googlePay: 'never',
            applePay: 'never',
          },
        };
      }
    }

    return {
      paymentMethods: {
        googlePay: 'auto',
        applePay: 'auto',
        link: 'auto',
      },
    };
  }, [activePaymentProvider]);

  //切换 active wallet 时把 key 提升到 StripeElementProvider 上，强制整棵 Stripe Elements
  // tree 销毁重建，确保新的 paymentMethods 配置生效（Stripe 不保证已创建的 Element
  // 在 update 时即时反映 paymentMethods 变化）。
  const expressElementKey = useMemo(() => {
    return ALLOWED_EXPRESS_PAYMENT_PROVIDERS.includes(activePaymentProvider)
      ? activePaymentProvider
      : 'express-checkout-element';
  }, [activePaymentProvider]);

  return (
    <StripeElementProvider
      key={expressElementKey}
      stripePublicKey={stripePublicKey}
      amount={amount}
      extraOptions={extraOptions}
    >
      <ExpressElement
        extraElementOptions={extraElementOptions}
        onReady={({ availablePaymentMethods }) => {
          if (availablePaymentMethods) {
            onGetAvailablePaymentMethods(availablePaymentMethods);
          }
        }}
        placeOrderHandler={placeOrderHandler}
        onClick={prepareCheckHandler}
        onError={(e) => {
          onError?.(typeof e === 'string' ? e : 'Payment failed, please try again');
        }}
      />
    </StripeElementProvider>
  );
}

export type ExpressCheckoutElementProps = Parameters<typeof ExpressCheckoutElement>[0];
