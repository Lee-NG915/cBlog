'use client';
import { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { logger } from '@castlery/observability';
import { MarketCurrency } from '@castlery/config';

interface StripeElementProviderProps {
  stripePublicKey: string;
  amount: number;
  children: React.ReactNode;
  extraOptions?: StripeElementsOptions;
}
// docs.stripe.com/payments/accept-a-payment-deferred?platform=web&type=payment#submit-the-payment
/**
 *
 * Stripe Payment Element
 *  基本集成教程：见 Accept a payment ： https://docs.stripe.com/payments/accept-a-payment?payment-ui=elements
 * Payment Element API 参考：见 Payment Element ： https://docs.stripe.com/js/elements_object/create_payment_element
 * 定制样式指南：见 Style the Payment Element： https://docs.stripe.com/payments/payment-element#appearance
 * 布局选项：见 Payment Element layouts ： https://docs.stripe.com/payments/payment-element#layout
 * @returns
 * @example https://docs.stripe.com/payments/accept-a-payment-deferred?type=payment
 */
export function StripeElementProvider({
  stripePublicKey,
  amount,
  extraOptions = {},
  children,
}: StripeElementProviderProps) {
  const stripePromise = useMemo(() => loadStripe(stripePublicKey), [stripePublicKey]);

  // Convert amount to smallest currency unit (cents for CAD, USD, SGD, AUD, GBP, etc.)
  // Stripe requires amounts in the currency's smallest unit (e.g., cents for dollars)
  const amountInSmallestUnit = useMemo(() => {
    const totalAmount = Number(amount);
    if (!totalAmount || totalAmount <= 0) {
      logger.error('Invalid amount for Stripe payment', { amount });
      return 0;
    }
    const zeroDecimalCurrencies = ['jpy', 'vnd', 'krw'];
    if (zeroDecimalCurrencies.includes(MarketCurrency.toLowerCase())) {
      return Math.round(totalAmount);
    }
    // For currencies like CAD, USD, SGD, AUD, GBP, multiply by 100 to get cents
    // For zero-decimal currencies like JPY, use the amount directly
    // Since we're using MarketCurrency which is one of CAD/USD/SGD/AUD/GBP, we multiply by 100
    return Math.round(totalAmount * 100);
  }, [amount]);

  // Collect payment information first, then create intent
  const elementsOptions: StripeElementsOptions = useMemo(() => {
    if (amountInSmallestUnit <= 0) {
      logger.error('Invalid amount in smallest unit', { amount, amountInSmallestUnit });
    }

    // 使用展开运算符合并 extraOptions，但确保 mode、amount、currency 优先级最高
    const { clientSecret, mode: _mode, ...restExtraOptions } = extraOptions as any;
    return {
      ...restExtraOptions,
      mode: 'payment',
      amount: amountInSmallestUnit,
      currency: MarketCurrency.toLowerCase(),
    };
  }, [amountInSmallestUnit, amount, extraOptions]);

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}

/**
 * 用 Payment Element 在客户端收集支付信息。Payment Element 是一个预构建的 UI 组件，它简化了多种支付方式的收集支付详情的流程。
 * Payment Element 中包含一个 iframe，它通过一个 HTTPS 连接安全地将支付信息发送到 Stripe。避免将 Payment Element 放在另一个 iframe 中，因为有些支付方式需要重定向到另一个页面进行付款确认。
 * 如果您确实选择使用 iframe 并想要接受 Apple Pay 或 Google Pay，则 iframe 必须要将 allow#attr-allowpaymentrequest) 属性设置为等于 "payment *"。
 * 结账页面上的地址也必须以 https:// 开头，不能是 http://，否则您的集成不能工作。您可以在不使用 HTTPS 的情况下测试您的集成，准备好进行真实收款时将它启用。
 */
