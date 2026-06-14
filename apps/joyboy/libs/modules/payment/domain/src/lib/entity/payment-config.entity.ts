/**
 * Provider-specific payment configuration types.
 * These are passed from the Component layer into the Server Action
 * and forwarded to the corresponding Strategy.
 */

export type StripePaymentConfig = {
  paymentMethodId?: string;
  checkoutSession?: string;
  saveCard?: boolean;
};

export type AffirmPaymentConfig = {
  cancelUrl: string;
  returnUrl: string;
  platform: 'web' | 'ios' | 'android';
};

export type GrabPayConfig = Record<string, never>;

export type PaypalPaymentConfig = {
  orderId?: string;
  payerId?: string;
};

export type TwoCTwoPConfig = {
  paymentToken: string;
  transactionId: string;
  responseCode: string;
};

export type ZipPayConfig = {
  token?: string;
};
