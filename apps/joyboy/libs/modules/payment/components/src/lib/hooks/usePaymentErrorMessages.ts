import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

/**
 * Static keys that map to error message entries in the i18n resource.
 * Use these constants wherever a specific payment error must be referenced,
 * so that renaming a key causes a compile-time error rather than a silent miss.
 */
export const PAYMENT_ERROR_KEYS = {
  /** Payment method provider is not selected */
  PROVIDER_NOT_SELECTED: 'providerNotSelected',
  /** Order response is missing required fields */
  ORDER_DATA_MISSING: 'orderDataMissing',
  /** SDK / local validation of the payment method failed */
  PAYMENT_VALIDATION_FAILED: 'paymentValidationFailed',
  /** TAU or pre-submit order condition check failed */
  ORDER_CONDITION_CHECK_FAILED: 'orderConditionCheckFailed',
  /** Generic failure during payment processing */
  PROCESS_PAYMENT_FAILED: 'processPaymentFailed',
  /** Stripe submit / confirm handler was not yet registered */
  STRIPE_HANDLER_NOT_INITIALIZED: 'stripeHandlerNotInitialized',
  /** Order creation failed before payment submission */
  CREATE_ORDER_FAILED: 'createOrderFailed',
  /** Order already has a completed payment (PAID / CAPTURED) and cannot be paid again */
  ORDER_ALREADY_PAID: 'orderAlreadyPaid',
  /** Stripe SDK failed to initialize */
  STRIPE_INITIALIZED_FAILED: 'stripeInitializedFailed',
  /** Stripe Elements failed to initialize */
  ELEMENTS_INITIALIZED_FAILED: 'elementsInitializedFailed',
  /** Client secret was not provided when confirming payment */
  CLIENT_SECRET_NOT_PROVIDED: 'clientSecretNotProvided',
  /** elements.submit() threw or returned an error without a message */
  PAYMENT_ELEMENT_SUBMIT_FAILED: 'paymentElementSubmitFailed',
  /** stripe.confirmPayment() threw or returned an error without a message */
  PAYMENT_CONFIRM_FAILED: 'paymentConfirmFailed',
} as const;

export type PaymentErrorKey = (typeof PAYMENT_ERROR_KEYS)[keyof typeof PAYMENT_ERROR_KEYS];

export type PaymentErrorMessages = Record<PaymentErrorKey, string>;

/**
 * Returns a memoized map of translated payment error messages.
 * All static error strings in the payment flow should be sourced from here
 * instead of being hardcoded inline.
 *
 * Dynamic error strings returned by external APIs / SDKs are used as-is;
 * use the values from this hook only as fallbacks for those cases.
 */
export function usePaymentErrorMessages(): PaymentErrorMessages {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.paymentWallets.errors',
  });

  return useMemo(
    () => ({
      [PAYMENT_ERROR_KEYS.PROVIDER_NOT_SELECTED]: t('providerNotSelected'),
      [PAYMENT_ERROR_KEYS.ORDER_DATA_MISSING]: t('orderDataMissing'),
      [PAYMENT_ERROR_KEYS.PAYMENT_VALIDATION_FAILED]: t('paymentValidationFailed'),
      [PAYMENT_ERROR_KEYS.ORDER_CONDITION_CHECK_FAILED]: t('orderConditionCheckFailed'),
      [PAYMENT_ERROR_KEYS.PROCESS_PAYMENT_FAILED]: t('processPaymentFailed'),
      [PAYMENT_ERROR_KEYS.STRIPE_HANDLER_NOT_INITIALIZED]: t('stripeHandlerNotInitialized'),
      [PAYMENT_ERROR_KEYS.CREATE_ORDER_FAILED]: t('createOrderFailed'),
      [PAYMENT_ERROR_KEYS.ORDER_ALREADY_PAID]: t('orderAlreadyPaid'),
      [PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED]: t('stripeInitializedFailed'),
      [PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED]: t('elementsInitializedFailed'),
      [PAYMENT_ERROR_KEYS.CLIENT_SECRET_NOT_PROVIDED]: t('clientSecretNotProvided'),
      [PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED]: t('paymentElementSubmitFailed'),
      [PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED]: t('paymentConfirmFailed'),
    }),
    [t]
  );
}
