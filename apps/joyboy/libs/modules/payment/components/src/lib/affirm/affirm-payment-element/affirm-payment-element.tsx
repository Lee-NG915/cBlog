'use client';
import type { SdkInitiateResult } from '../../paypal/paypal-payment-element/paypal-payment-element';

export interface AffirmPaymentElementProps {
  /**
   * Called when the user clicks the Affirm button.
   * Responsible for order creation (if needed) + initiatePaymentAction.
   * Returns null if initiation failed (error state is handled by the caller).
   */
  onInitiate: () => Promise<SdkInitiateResult | null>;
  /**
   * Called after Affirm checkout completes successfully.
   * Responsible for capturePaymentAction + success redirect.
   */
  onCapture: (params: SdkInitiateResult & { checkoutToken: string }) => Promise<void>;
  onError: (error: { failureCode?: string; errorMessage: string }) => void;
}

export function AffirmPaymentElement({ onInitiate, onCapture, onError }: AffirmPaymentElementProps) {
  const handleClick = async () => {
    const result = await onInitiate();
    if (!result) return;

    if (!window.affirm?.checkout?.open) {
      onError({ failureCode: 'AFFIRM_NOT_LOADED', errorMessage: 'Affirm SDK is not loaded' });
      return;
    }

    window.affirm.checkout.open(
      { checkout_token: result.sdkToken },
      async ({ checkout_token }: { checkout_token: string }) => {
        // successCb
        await onCapture({ ...result, checkoutToken: checkout_token });
      },
      () => {
        // cancelCb — user dismissed, silent
      }
    );
  };

  return (
    <button type="button" onClick={handleClick}>
      Pay with Affirm
    </button>
  );
}
