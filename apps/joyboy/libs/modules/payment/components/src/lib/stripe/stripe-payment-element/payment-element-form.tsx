'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { type StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { CircularProgress, Box } from '@castlery/fortress';
import { useState, useEffect, useCallback } from 'react';
import { StripeAvailableCountryCode } from '@castlery/config';
import { IPaymentProcessingError } from '../../payment-wallets/types';
import { usePaymentErrorMessages, PAYMENT_ERROR_KEYS } from '../../hooks/usePaymentErrorMessages';

export function PaymentElementForm({
  billingAddress,
  onFormChange,
  onGetStripeSubmitHandler,
  onGetStripeConfirmHandler,
  onStripeLoadingChange,
}: {
  billingAddress: Record<string, string | number> | null;
  onFormChange: (paymentMethodType: string, complete: boolean) => void;
  onGetStripeSubmitHandler: (handler: () => Promise<boolean | IPaymentProcessingError>) => void;
  onGetStripeConfirmHandler: (
    handler: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>
  ) => void;
  onStripeLoadingChange?: (isLoading: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const errorMessages = usePaymentErrorMessages();

  const [loading, setLoading] = useState(false);

  const handleReady = useCallback(() => {
    setLoading(false);
    onStripeLoadingChange?.(false);
  }, [onStripeLoadingChange]);

  const handleLoadError = useCallback(() => {
    setLoading(false);
    onStripeLoadingChange?.(false);
  }, [onStripeLoadingChange]);

  const handleSubmit = useCallback(async () => {
    if (!stripe) {
      return {
        code: PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED,
        message: errorMessages[PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED],
      };
    }
    if (!elements) {
      return {
        code: PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED,
        message: errorMessages[PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED],
      };
    }
    try {
      const { error } = await elements.submit();
      if (error) {
        return {
          code: error.code || PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED,
          message: error.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED],
        };
      }
      return true;
    } catch (e) {
      return {
        code: PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED,
        message: (e as Error)?.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_ELEMENT_SUBMIT_FAILED],
      };
    }
  }, [stripe, elements, errorMessages]);

  const handleConfirmPayment = useCallback(
    async (clientSecret: string, returnUrl: string) => {
      if (!stripe)
        return {
          code: PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED,
          message: errorMessages[PAYMENT_ERROR_KEYS.STRIPE_INITIALIZED_FAILED],
        };
      if (!elements)
        return {
          code: PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED,
          message: errorMessages[PAYMENT_ERROR_KEYS.ELEMENTS_INITIALIZED_FAILED],
        };
      if (!clientSecret)
        return {
          code: PAYMENT_ERROR_KEYS.CLIENT_SECRET_NOT_PROVIDED,
          message: errorMessages[PAYMENT_ERROR_KEYS.CLIENT_SECRET_NOT_PROVIDED],
        };

      try {
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: returnUrl,
            ...(billingAddress?.country && {
              payment_method_data: {
                billing_details: {
                  address: {
                    country: StripeAvailableCountryCode,
                    postal_code: 'never',
                  },
                },
              },
            }),
          },
          redirect: 'if_required',
        });

        if (error) {
          return {
            code: error.code || PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED,
            message: error.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED],
          };
        }
        return true;
      } catch (e) {
        return {
          code: PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED,
          message: (e as Error)?.message || errorMessages[PAYMENT_ERROR_KEYS.PAYMENT_CONFIRM_FAILED],
        };
      }
    },
    [stripe, elements, billingAddress, errorMessages]
  );

  const onChange = useCallback(
    (event: StripePaymentElementChangeEvent) => {
      onFormChange(event.value.type, event.complete);
    },
    [onFormChange]
  );

  useEffect(() => {
    onGetStripeSubmitHandler(handleSubmit);
  }, [onGetStripeSubmitHandler, handleSubmit]);

  useEffect(() => {
    onGetStripeConfirmHandler(handleConfirmPayment);
  }, [onGetStripeConfirmHandler, handleConfirmPayment]);

  return (
    <>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
          <CircularProgress size="lg" color="neutral" />
        </Box>
      )}
      <PaymentElement
        onLoaderStart={() => {
          setLoading(true);
          onStripeLoadingChange?.(true);
        }}
        onReady={handleReady}
        onLoadError={handleLoadError}
        onChange={onChange}
        options={{
          wallets: {
            applePay: 'never',
            googlePay: 'never',
            link: 'auto',
          },
          fields: {
            billingDetails: {
              address: {
                country: 'never',
                postalCode: 'never',
              },
            },
          },
        }}
      />
    </>
  );
}
