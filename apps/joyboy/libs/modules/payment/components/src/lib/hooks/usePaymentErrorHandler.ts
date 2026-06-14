'use client';
import { useCallback } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import type { IPlaceOrderError } from '@castlery/types';
import { classifyPaymentError, type PaymentErrorCategory } from '../payment-wallets/utils/classify-payment-error';
import { extractClientErrorMessage } from '../payment-wallets/utils/extract-error-message';
import type { PaymentError } from '../payment-wallets/payment-wallets.types';

export interface HandlePaymentErrorContext {
  /** Reference number shown to the user inside the modal (e.g. order.number). */
  orderNumber: string;
}

export interface UsePaymentErrorHandlerReturn {
  /**
   * Unified entry point for all payment errors.
   *
   * Accepts any partial `IPlaceOrderError` (from API failures, SDK callbacks,
   * or local validation) plus the current order context, then:
   *   1. Classifies the error into a `PaymentErrorCategory`
   *   2. Resolves the i18n description from `paymentProcessingError.<category>`
   *      for normal payment-result categories
   *   3. Calls `setPaymentError` with a modal-type `PaymentError`
   *
   * All error paths in the payment flow should be funnelled through this
   * function instead of calling `setPaymentError` directly.
   */
  handlePaymentError: (error: Partial<IPlaceOrderError>, context: HandlePaymentErrorContext) => void;
  /**
   * Returns the translated description string for a given category.
   * Use this when only the message text is needed (e.g. inline / toast errors)
   * without triggering the full modal flow.
   */
  getErrorMessage: (category: PaymentErrorCategory) => string;
}

/**
 * @param setPaymentError - State setter from the payment container component.
 *   Injected so that this hook remains stateless and testable in isolation.
 */
export function usePaymentErrorHandler(setPaymentError: (error: PaymentError) => void): UsePaymentErrorHandlerReturn {
  const { t } = useTranslation(LocalesNamespace.ERROR, {
    keyPrefix: 'paymentProcessingError',
  });

  const handlePaymentError = useCallback(
    (error: Partial<IPlaceOrderError>, context: HandlePaymentErrorContext) => {
      const category = classifyPaymentError(error);
      const isAlreadyPaid = category === 'orderAlreadyPaid';
      const isThreedsAuth = category === 'threedsAuthError';
      const isPaypal = category === 'paypalError';

      setPaymentError({
        displayType: 'modal',
        category,
        title: t(
          isAlreadyPaid
            ? ('orderAlreadyPaidTitle' as any)
            : isThreedsAuth
            ? ('threedsAuthErrorTitle' as any)
            : ('title' as any)
        ),
        message: t(category as any),
        orderNumber: context.orderNumber,
        // Always surface raw provider details so unclassified BFF codes
        // (which fall through to `genericPaymentError`) still expose
        // failure_code / failure_info for user diagnosis and support.
        failureCode: error.failureCode,
        failureInfo: error.failureInfo
          ? extractClientErrorMessage(error.failureInfo, error.failureInfo)
          : !isPaypal && error.errorMessage
          ? extractClientErrorMessage(error.errorMessage, error.errorMessage)
          : undefined,
        // For PayPal, `errorMessage` is the provider `[SHORT]` and is rendered
        // via i18n interpolation, not as a standalone failureInfo line.
        shortMessage: isPaypal ? error.errorMessage : undefined,
        details: error.details ?? null,
      });
    },
    [t, setPaymentError]
  );

  const getErrorMessage = useCallback((category: PaymentErrorCategory): string => t(category as any), [t]);

  return { handlePaymentError, getErrorMessage };
}
