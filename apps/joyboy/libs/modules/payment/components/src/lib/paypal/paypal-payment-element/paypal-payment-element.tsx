'use client';
import { useRef } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { PaypalProvider } from '../../payments-provider/paypal-provider/paypal-provider';
import { PAYPAL_SDK_ERROR_CODE } from '../../payment-wallets/utils/classify-payment-error';

/**
 * Fixed `[SHORT]` text shown when a failure originates from the PayPal JS SDK
 * (popup closed, network blocked, SDK init failure, etc.). The raw SDK error
 * string carries developer-level wording that the PRD row 19 modal template
 * cannot render verbatim, so the SDK callback normalizes it: this constant is
 * used as `errorMessage` (the modal's `[SHORT]` slot) while the raw SDK error
 * is forwarded via `failureInfo` for observability and the modal's `[LONG]` slot.
 */
export const PAYPAL_SDK_SHORT_FALLBACK = 'Payment was interrupted.';

export type SdkInitiateResult = {
  sdkToken: string;
  paymentId: string;
  traceId: string;
  orderId: string;
  orderNumber: string;
};

export interface PaypalPaymentElementProps {
  paypalClientId: string;
  currency: string;
  /** Called before the PayPal popup opens. Return false to abort. */
  tauCheckHandler: (onProceed?: () => void) => boolean;
  /**
   * Called when the user clicks the PayPal button.
   * Responsible for order creation (if needed) + initiatePaymentAction.
   * Returns null if initiation failed (error state is handled by the caller).
   */
  onInitiate: () => Promise<SdkInitiateResult | null>;
  /**
   * Called after the user approves the payment in the PayPal popup.
   * Responsible for capturePaymentAction + success redirect.
   */
  onCapture: (params: SdkInitiateResult & { paypalOrderId: string; payerId?: string }) => Promise<void>;
  /**
   * `failureInfo` carries the raw SDK error string when the failure originates
   * from PayPal's JS SDK, mirroring the BFF `[LONG]` field so the modal layer
   * can render both `[SHORT]` (`errorMessage`) and `[LONG]` (`failureInfo`)
   * uniformly across BFF and SDK paths.
   */
  onError: (error: { failureCode?: string; errorMessage: string; failureInfo?: string }) => void;
}

export function PaypalPaymentElement({
  paypalClientId,
  currency,
  tauCheckHandler,
  onInitiate,
  onCapture,
  onError,
}: PaypalPaymentElementProps) {
  // Stores the initiate result between createOrder and onApprove callbacks
  const pendingRef = useRef<SdkInitiateResult | null>(null);
  // When onInitiate() fails it already sets the error state in the parent.
  // This flag prevents the subsequent PayPal onError callback from firing a second popup.
  const initiateFailedRef = useRef(false);

  return (
    <PaypalProvider paypalPublicKey={paypalClientId} currency={currency}>
      <PayPalButtons
        onClick={async (_data, actions) => {
          if (!tauCheckHandler()) return actions.reject();
          return actions.resolve();
        }}
        createOrder={async () => {
          initiateFailedRef.current = false;
          const result = await onInitiate();
          if (!result) {
            initiateFailedRef.current = true;
            throw new Error('Failed to initiate PayPal payment');
          }
          pendingRef.current = result;
          return result.sdkToken;
        }}
        onApprove={async (data) => {
          const pending = pendingRef.current;
          pendingRef.current = null;
          if (!pending) {
            onError({ errorMessage: 'Payment initiation data is missing' });
            return;
          }
          await onCapture({
            ...pending,
            paypalOrderId: data.orderID,
            payerId: data.payerID ?? undefined,
          });
        }}
        onCancel={() => {
          pendingRef.current = null;
        }}
        onError={(err) => {
          pendingRef.current = null;
          if (initiateFailedRef.current) {
            // Error already handled by onInitiate; skip to avoid duplicate popup.
            initiateFailedRef.current = false;
            return;
          }
          // PRD row 19 template expects a PayPal-provided `[SHORT]` text; the
          // raw SDK error is dev-facing and unsuitable as user copy. Normalize
          // to a fixed `[SHORT]` and forward the raw string as `[LONG]`/info.
          onError({
            failureCode: PAYPAL_SDK_ERROR_CODE,
            errorMessage: PAYPAL_SDK_SHORT_FALLBACK,
            failureInfo: String(err),
          });
        }}
      />
    </PaypalProvider>
  );
}
