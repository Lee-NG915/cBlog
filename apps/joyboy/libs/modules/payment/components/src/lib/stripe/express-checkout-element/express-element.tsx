'use client';
import type {
  AvailablePaymentMethods,
  StripeError,
  StripeExpressCheckoutElementClickEvent,
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementOptions,
  StripeExpressCheckoutElementReadyEvent,
} from '@stripe/stripe-js';
import { useCallback, useEffect, useRef } from 'react';
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { logger, captureStructuredError, BUSINESS_DOMAIN, addBreadcrumb } from '@castlery/observability';
import type { IPaymentProcessingError } from '../../payment-wallets/types';
import { usePaymentErrorMessages, PAYMENT_ERROR_KEYS } from '../../hooks/usePaymentErrorMessages';

export type AvailableStripeExpressPaymentMethods = AvailablePaymentMethods;

interface ExpressElementProps {
  extraElementOptions: Partial<StripeExpressCheckoutElementOptions>;
  onReady: (result: StripeExpressCheckoutElementReadyEvent) => void;
  onClick: () => boolean;
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
  onError?: (errorMessage: string) => void;
  onCancel?: (event: { elementType: 'expressCheckout' }) => void;
}
export function ExpressElement({
  extraElementOptions,
  onReady,
  onCancel,
  placeOrderHandler,
  onClick,
  onError,
}: ExpressElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const errorMessages = usePaymentErrorMessages();
  const isMountedRef = useRef(true);

  // Track component mounted state to prevent operations after unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Wrap onReady to add debugging info and mounted check
  const handleReady = useCallback(
    (event: StripeExpressCheckoutElementReadyEvent) => {
      if (!isMountedRef.current) {
        return;
      }

      try {
        logger.info('[ExpressElement] onReady>>', { event });
        logger.info('[ExpressElement] Available payment methods:', {
          availablePaymentMethods: event.availablePaymentMethods,
        });
        onReady(event);
      } catch (error) {
        logger.error('[ExpressElement] Error in handleReady:', { error });
      }
    },
    [onReady]
  );

  const submitHandler = useCallback(async (): Promise<boolean | IPaymentProcessingError> => {
    if (!elements) {
      logger.error('[ExpressElement] submitHandler: elements not initialized');
      captureStructuredError(new Error('Express Checkout elements not initialized'), {
        domain: BUSINESS_DOMAIN.PAYMENT,
        extra: { step: 'ExpressElement.submitHandler' },
      });
      return {
        code: PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED,
        message: errorMessages[PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED],
      };
    }
    addBreadcrumb({ message: 'elements.submit start', domain: BUSINESS_DOMAIN.PAYMENT });
    try {
      const res = await elements.submit();
      if (res.error) {
        logger.error('[ExpressElement] elements.submit failed', { error: res.error });
        captureStructuredError(new Error(res.error.message ?? 'elements.submit failed'), {
          domain: BUSINESS_DOMAIN.PAYMENT,
          extra: {
            step: 'ExpressElement.elements.submit',
            failureCode: res.error.code,
            errorMessage: res.error.message,
          },
        });
        return {
          code: res.error.code || PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED,
          message: res.error.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED],
        };
      }
      addBreadcrumb({ message: 'elements.submit success', domain: BUSINESS_DOMAIN.PAYMENT });
      return true;
    } catch (e) {
      logger.error('[ExpressElement] elements.submit threw', { error: e });
      captureStructuredError(e, {
        domain: BUSINESS_DOMAIN.PAYMENT,
        extra: { step: 'ExpressElement.elements.submit.catch' },
      });
      return {
        code: PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED,
        message: (e as Error)?.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED],
      };
    }
  }, [elements, errorMessages]);

  const confirmHandler = useCallback(
    async (clientSecret: string, returnUrl: string): Promise<boolean | IPaymentProcessingError> => {
      if (!stripe || !elements) {
        return {
          code: PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED,
          message: errorMessages[PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED],
        };
      }
      try {
        const res = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: returnUrl,
          },
          redirect: 'if_required',
        });
        if (res.error) {
          return {
            code: res.error.code || PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED,
            message: res.error.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED],
          };
        }
        return true;
      } catch (e) {
        logger.error('[ExpressElement] stripe.confirmPayment threw', { error: e });
        captureStructuredError(e, {
          domain: BUSINESS_DOMAIN.PAYMENT,
          extra: { step: 'ExpressElement.stripe.confirmPayment.catch' },
        });
        return {
          code: PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED,
          message: (e as Error)?.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED],
        };
      }
    },
    [stripe, elements, errorMessages]
  );

  const handleConfirm = useCallback(
    async (result: StripeExpressCheckoutElementConfirmEvent) => {
      if (!isMountedRef.current) {
        logger.warn('[ExpressElement] onConfirm called after unmount, skipping');
        return;
      }

      logger.info('[ExpressElement] handleConfirm>>', {
        expressPaymentType: result.expressPaymentType,
      });
      addBreadcrumb({
        message: 'ExpressCheckout onConfirm start',
        domain: BUSINESS_DOMAIN.PAYMENT,
        data: { expressPaymentType: result.expressPaymentType },
      });

      try {
        const response = await placeOrderHandler({
          submitHandler,
          confirmHandler,
        });

        // Check if component is still mounted after async operation
        if (!isMountedRef.current) {
          logger.warn('[ExpressElement] Component unmounted during payment processing');
          return;
        }

        logger.info('[ExpressElement] placeOrderHandler response', {
          status: response.status,
          errorMessage: response.errorMessage,
          paymentId: response.paymentId,
          provider: response.provider,
        });

        // Only call paymentFailed if the order placement actually failed
        if (response.status === 'error' && typeof result.paymentFailed === 'function') {
          const errorMessage = response.errorMessage || `${result.expressPaymentType} payment failed, please try again`;
          logger.error('[ExpressElement] Calling paymentFailed', {
            expressPaymentType: result.expressPaymentType,
            errorMessage,
          });
          captureStructuredError(new Error(errorMessage), {
            domain: BUSINESS_DOMAIN.PAYMENT,
            extra: {
              step: 'ExpressElement.handleConfirm.paymentFailed',
              expressPaymentType: result.expressPaymentType,
              errorMessage,
            },
          });
          result.paymentFailed({ reason: 'fail', message: errorMessage });
        }
      } catch (error) {
        logger.error('[ExpressElement] Unexpected error in handleConfirm', { error });
        captureStructuredError(error, {
          domain: BUSINESS_DOMAIN.PAYMENT,
          extra: {
            step: 'ExpressElement.handleConfirm.unexpectedError',
            expressPaymentType: result.expressPaymentType,
          },
        });

        if (!isMountedRef.current) return;

        const errorMessage = error instanceof Error ? error.message : 'Payment failed, please try again';

        // Call onError to reset page loading state and show error toast
        if (typeof onError === 'function') {
          onError(errorMessage);
        }

        // Also notify Stripe that payment failed (best-effort, may be no-op if modal is closed)
        if (typeof result.paymentFailed === 'function') {
          try {
            result.paymentFailed({ reason: 'fail', message: errorMessage });
          } catch {
            // Ignore errors from paymentFailed when the modal is already closed
          }
        }
      }
    },
    [placeOrderHandler, submitHandler, confirmHandler]
  );

  const handleClick = useCallback(
    (event: StripeExpressCheckoutElementClickEvent) => {
      const result = onClick();
      if (!result) {
        event.reject();
        return;
      }
      event.resolve();
    },
    [onClick]
  );

  const handleLoadError = useCallback((event: { elementType: 'expressCheckout'; error: StripeError }) => {
    if (!isMountedRef.current) {
      logger.warn('[ExpressElement] onLoadError called after unmount, skipping');
      return;
    }

    logger.error('[ExpressElement] onLoadError>>', { error: event.error });
    captureStructuredError(new Error(event.error?.message ?? 'ExpressCheckoutElement load error'), {
      domain: BUSINESS_DOMAIN.PAYMENT,
      extra: {
        step: 'ExpressElement.onLoadError',
        failureCode: event.error?.code,
        errorMessage: event.error?.message,
      },
    });
  }, []);

  // Don't render if Stripe hasn't loaded yet
  if (!stripe || !elements) {
    logger.info('[ExpressElement] Waiting for Stripe to load...');
    return null;
  }

  return (
    <ExpressCheckoutElement
      options={{
        ...extraElementOptions,
      }}
      onClick={handleClick}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      onReady={handleReady}
      onLoadError={handleLoadError}
    />
  );
}
