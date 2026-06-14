/**
 * Controls how a payment error is surfaced to the user.
 *
 * - inline : shown as a text tip directly on the payment form (non-blocking)
 * - toast  : shown as a transient notification (auto-dismisses, non-blocking)
 * - modal  : shown as a blocking dialog that requires explicit user dismissal
 */
import type { PaymentErrorCategory } from './utils/classify-payment-error';

export type PaymentErrorDisplayType = 'inline' | 'toast' | 'modal';

interface PaymentErrorBase {
  message: string;
}

export interface PaymentErrorNonModal extends PaymentErrorBase {
  displayType: 'inline' | 'toast';
}

/**
 * Modal errors require an order number to be displayed.
 * title overrides the default modal heading when provided.
 * failureCode and failureInfo are optional details from the payment provider.
 * category drives special modal layouts (e.g. orderExpired, orderCanceled).
 * shortMessage carries the provider `[SHORT]` text and is interpolated into
 * i18n templates that include a `{{shortMessage}}` slot (currently only the
 * `paypalError` template per PRD row 19).
 */
export interface PaymentErrorModal extends PaymentErrorBase {
  displayType: 'modal';
  category?: PaymentErrorCategory;
  orderNumber: string;
  title?: string;
  failureCode?: string;
  failureInfo?: string;
  shortMessage?: string;
  details?: Record<string, any>;
}

export type PaymentError = PaymentErrorNonModal | PaymentErrorModal;

export interface PaymentState {
  error: PaymentError | null;
  isProcessing: boolean;
  isReadyToSubmit: boolean;
}
