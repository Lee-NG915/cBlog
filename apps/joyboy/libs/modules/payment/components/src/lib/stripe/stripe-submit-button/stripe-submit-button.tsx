'use client';

import { useCheckout } from '@stripe/react-stripe-js';
import type { StripeCheckoutConfirmResult, StripeCheckoutSession, ConfirmError } from '@stripe/stripe-js';
import { Button } from '@castlery/fortress';

export function StripeSubmitButton({
  onSuccess,
  onError,
}: {
  onSuccess: (session: StripeCheckoutSession) => void;
  onError: (error: ConfirmError) => void;
}) {
  const checkout = useCheckout();

  const submitStripePayment = async () => {
    const confirmResult: StripeCheckoutConfirmResult = await checkout.confirm({
      returnUrl: '', // success page
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (confirmResult.type === 'error') {
      console.error(confirmResult.error);
      onError(confirmResult.error);
    }
    if (confirmResult.type === 'success') {
      onSuccess(confirmResult.session);
    }
  };

  return <Button onClick={submitStripePayment}>Place Your Order</Button>;
}
