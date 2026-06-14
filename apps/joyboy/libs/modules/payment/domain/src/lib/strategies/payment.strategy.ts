import type { PaymentMethodProviderEnum } from '../entity/payment-feature.entity';
import type {
  StripePaymentConfig,
  AffirmPaymentConfig,
  GrabPayConfig,
  PaypalPaymentConfig,
  TwoCTwoPConfig,
  ZipPayConfig,
} from '../entity/payment-config.entity';

// ─── Unified response type (Result pattern) ──────────────────────────────────

export type IPaymentResponseError = {
  code: string;
  message: string;
  httpStatus?: number;
  details?: Record<string, unknown>;
};

export type IPaymentResponseResult<T, E extends IPaymentResponseError = IPaymentResponseError> =
  | { success: true; data: T }
  | { success: false; error: E };

// ─── Provider config schema ───────────────────────────────────────────────────

export type ProviderConfigSchema = {
  provider: PaymentMethodProviderEnum;
  stripeConfig?: StripePaymentConfig;
  affirmConfig?: AffirmPaymentConfig;
  grabPayConfig?: GrabPayConfig;
  paypalConfig?: PaypalPaymentConfig;
  twoCTwoPConfig?: TwoCTwoPConfig;
  zipPayConfig?: ZipPayConfig;
};

// ─── initiatePaymentIntent ────────────────────────────────────────────────────

// Fix: was a class — changed to type so callers can use plain object literals without `as any`
export type InitiatePaymentCommand<TConfig extends ProviderConfigSchema = ProviderConfigSchema> = {
  orderNumber: string;
  orderId: string;
  amount: string;
  currency: string;
  idempotencyKey: string;
  config: TConfig;
  metadata?: Record<string, unknown>;
};

export type InitiatePaymentIntentResult = IPaymentResponseResult<{
  paymentId: string;
  paymentResult: {
    stripeResult?: {
      clientSecret: string;
    };
    paypalResult?: {
      redirectUrl: string;
      paypalOrderId: string;
      intent: string;
    };
    redirectUrl?: string;
    /** Generic SDK token for non-Stripe providers (e.g. 2C2P paymentToken). */
    sdkToken?: string;
  };
}>;

// ─── capturePayment ───────────────────────────────────────────────────────────
//
// capturePayment is the mandatory final step for ALL payment providers.
// Trigger timing differs by provider type:
//   - SDK-based (Stripe, 2C2P): called synchronously after SDK confirmation succeeds
//   - Redirect-based (PayPal, GrabPay, ZipPay, Affirm): called when the user returns
//     from the third-party page via the callback route (reserved, not yet implemented)

export type CapturePaymentParams = {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  provider: PaymentMethodProviderEnum;
  amount?: string;
  idempotencyKey?: string;
  // Provider-specific result data returned from third-party after redirect
  affirmData?: {
    checkoutId: string;
    authorizationId?: string;
    checkoutToken?: string;
  };
  grabPayData?: {
    grabTxID: string;
    partnerTxID: string;
  };
  paypalData?: {
    orderId: string;
    payerId?: string;
  };
  twoCTwoPData?: {
    paymentToken: string;
    transactionId: string;
    responseCode: string;
  };
};

export type CapturePaymentResult = IPaymentResponseResult<{ orderId: string }>;

// ─── ActionSchema (instruction relay protocol) ────────────────────────────────
//
// The ActionSchema is the ONLY protocol between the Service layer and the
// Component layer. UI components must not branch on the payment provider
// type directly—they must only react to the ActionSchema action field.
//
// 'SDK_CONFIRM' : Client must call the provider SDK (e.g. stripe.confirmPayment)
// 'REDIRECT'    : Client must navigate to redirectUrl; the provider will call
//                 back to returnUrl when done (reserved callback page, TBD)
// 'SDK_POPUP'   : Client must open a third-party SDK popup (e.g. PayPal / Affirm).
//                 sdkToken is the provider-specific token (PayPal orderId / Affirm checkoutToken).
//                 The provider calls back via JS callbacks; the page does not navigate away.
// 'SUCCESS'     : No further client action needed; call capturePaymentAction directly

export type ActionSchema =
  | { action: 'SDK_CONFIRM'; clientSecret: string; paymentId: string }
  | {
      action: 'REDIRECT';
      redirectUrl: string;
      paymentId: string;
      /** Reserved: the URL the third-party provider should redirect back to. */
      returnUrl: string;
    }
  | {
      action: 'SDK_POPUP';
      paymentId: string;
      /** Provider-specific token: PayPal orderId or Affirm checkoutToken. */
      sdkToken: string;
    }
  | { action: 'SUCCESS'; paymentId: string };

// ─── Base strategy interface ──────────────────────────────────────────────────

/** Params for the best-effort rollback call when a payment must be voided. */
export type RemovePaymentParams = {
  orderId?: string;
  paymentId?: string;
};

export interface IPaymentStrategy<TConfig extends ProviderConfigSchema = ProviderConfigSchema> {
  readonly type: PaymentMethodProviderEnum;
  initiatePaymentIntent(cmd: InitiatePaymentCommand<TConfig>): Promise<InitiatePaymentIntentResult>;
  /**
   * Mandatory final step for all providers.
   * Calls the backend confirm API to close the payment loop.
   */
  capturePayment(params: CapturePaymentParams): Promise<CapturePaymentResult>;
  removeInitiatedPayment(params?: RemovePaymentParams): Promise<void>;
}

// ─── Strategy factory interface ──────────────────────────────────────────────
//
// Defined here (Domain) so Services can depend on the interface without knowing
// about Infrastructure.
//
// Architecture note: The concrete PaymentStrategyFactory lives in Infrastructure
// (not Services as the original design doc suggested). This keeps Services
// implementation-agnostic — it only sees the IPaymentStrategyFactory interface.
// The Actions layer acts as composition root, wiring PaymentService with the
// concrete factory. This avoids a Services → Infrastructure dependency.

export interface IPaymentStrategyFactory {
  get(provider: PaymentMethodProviderEnum, traceId: string): IPaymentStrategy;
}

// ─── Optional capability traits ───────────────────────────────────────────────

/**
 * Stripe requires a client-side elements.submit() call before initiatePaymentIntent.
 * Implementing this trait signals that the Component layer must perform
 * that pre-submission step before calling initiatePaymentAction.
 */
export interface ISubmitInformation {
  submitPaymentInfo(data?: unknown): Promise<void>;
}

/**
 * Providers that require an intermediate step between initiatePaymentIntent
 * and capturePayment must implement this trait.
 * Returns an ActionSchema instructing the client on the next action:
 *   - SDK_CONFIRM for Stripe/2C2P
 *   - REDIRECT for PayPal/GrabPay/ZipPay/Affirm
 */
export interface IConfirmPayment {
  confirmPayment(intentResult: InitiatePaymentIntentResult): Promise<ActionSchema>;
}
