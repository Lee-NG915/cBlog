'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import { TransactionDomain, trackTransactionSuccess } from '@castlery/observability';
import type { AvailableStripeExpressPaymentMethods } from '../../stripe/express-checkout-element/express-checkout-element';
import type { PaymentState } from '../payment-wallets.types';
import type { useGetFormattedMethodsSettings } from '../../hooks/useGetFormattedMethodsSettings';

const STRIPE_EXPRESS_METHOD_KEYS = [
  PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
  PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
  PaymentMethodProviderEnum.STRIPE_LINK_PAY,
] as const;

export function usePaymentMethodSelection({
  supportedMethods,
  defaultSelectedKey,
  updatePaymentState,
}: {
  supportedMethods: ReturnType<typeof useGetFormattedMethodsSettings>;
  defaultSelectedKey?: string;
  updatePaymentState: (updates: Partial<PaymentState>) => void;
}) {
  const [availableExpressMethods, setAvailableExpressMethods] = useState<Partial<AvailableStripeExpressPaymentMethods>>(
    { applePay: false, googlePay: false, link: false }
  );
  const detectedExpressMethodsRef = useRef<AvailableStripeExpressPaymentMethods | null>(null);

  const defaultSelectedMethod = useMemo(() => {
    if (defaultSelectedKey) {
      const method = supportedMethods.find((m) => m.key === defaultSelectedKey);
      if (method) return method;
    }
    return supportedMethods.find((m) => m.key === PaymentMethodProviderEnum.STRIPE_ONLINE) || null;
  }, [supportedMethods, defaultSelectedKey]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodProviderEnum | null>(
    defaultSelectedMethod?.key || null
  );

  // Fallback: set default once configs load (supportedMethods may be empty on first render)
  useEffect(() => {
    if (!selectedPaymentMethod && defaultSelectedMethod?.key) {
      setSelectedPaymentMethod(defaultSelectedMethod.key as PaymentMethodProviderEnum);
    }
  }, [defaultSelectedMethod, selectedPaymentMethod]);

  const handleSelectPaymentMethod = useCallback((key: string) => {
    setSelectedPaymentMethod(key as PaymentMethodProviderEnum);
    trackTransactionSuccess(
      {
        domain: TransactionDomain.PAYMENT,
        step: 'payment_method_select',
        provider: key,
        paymentMethodKey: key,
      },
      {
        message: 'transaction.payment.payment_method_select.success',
        skipSentry: true,
      }
    );
  }, []);

  const isStripeSelected = selectedPaymentMethod === PaymentMethodProviderEnum.STRIPE_ONLINE;
  const isPaypalSelected = selectedPaymentMethod === PaymentMethodProviderEnum.PAYPAL_ONLINE;
  const isAffirmSelected = selectedPaymentMethod === PaymentMethodProviderEnum.AFFIRM;
  const isGrabPaySelected = selectedPaymentMethod === PaymentMethodProviderEnum.GRABPAY;
  const isTwoCTwoPSelected = selectedPaymentMethod === PaymentMethodProviderEnum.TWO_C2P;
  const isExpressMethodSelected = STRIPE_EXPRESS_METHOD_KEYS.includes(
    selectedPaymentMethod as (typeof STRIPE_EXPRESS_METHOD_KEYS)[number]
  );

  // ExpressCheckoutElement 默认会同时上报多个可用 wallet（如 macOS Safari 会同时返回 applePay+link），
  // 业务上只允许在 methods list 出现一个 express 入口：Apple Pay > Google Pay > Link Pay（兜底）。
  const chosenExpressWallet = useMemo<PaymentMethodProviderEnum | null>(() => {
    if (availableExpressMethods.applePay) return PaymentMethodProviderEnum.STRIPE_APPLE_PAY;
    if (availableExpressMethods.googlePay) return PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY;
    if (availableExpressMethods.link) return PaymentMethodProviderEnum.STRIPE_LINK_PAY;
    return null;
  }, [availableExpressMethods]);

  const visibleMethods = useMemo(() => {
    const availability: Record<string, boolean> = {
      [PaymentMethodProviderEnum.STRIPE_APPLE_PAY]: chosenExpressWallet === PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
      [PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY]:
        chosenExpressWallet === PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
      [PaymentMethodProviderEnum.STRIPE_LINK_PAY]: chosenExpressWallet === PaymentMethodProviderEnum.STRIPE_LINK_PAY,
    };
    return supportedMethods
      .filter((m): m is typeof m & { key: PaymentMethodProviderEnum } => {
        if (!m.key) return false;
        return m.key in availability ? availability[m.key] : true;
      })
      .map(({ key, label, icons, instructionText }) => ({ key, label, icons, instructionText }));
  }, [supportedMethods, chosenExpressWallet]);

  const activeProvider = useMemo(
    () =>
      supportedMethods.find((m) => m.key === selectedPaymentMethod)?.provider as PaymentMethodProviderEnum | undefined,
    [selectedPaymentMethod, supportedMethods]
  );

  const stripePublicKey = useMemo(
    () =>
      supportedMethods.find((m) => m.key === PaymentMethodProviderEnum.STRIPE_ONLINE)?.stripePublicKey?.publicApiKey,
    [supportedMethods]
  );

  const paypalClientId = useMemo(
    () => supportedMethods.find((m) => m.key === PaymentMethodProviderEnum.PAYPAL_ONLINE)?.paypalConfig?.clientId,
    [supportedMethods]
  );

  const onExpressMethodsDetected = useCallback(
    (methods: AvailableStripeExpressPaymentMethods) => {
      if (!detectedExpressMethodsRef.current) {
        detectedExpressMethodsRef.current = methods;
        setAvailableExpressMethods(methods);
        updatePaymentState({ isReadyToSubmit: true });
      }
    },
    [updatePaymentState]
  );

  return {
    selectedPaymentMethod,
    visibleMethods,
    isStripeSelected,
    isPaypalSelected,
    isAffirmSelected,
    isGrabPaySelected,
    isTwoCTwoPSelected,
    isExpressMethodSelected,
    activeProvider,
    stripePublicKey,
    paypalClientId,
    handleSelectPaymentMethod,
    onExpressMethodsDetected,
  };
}
