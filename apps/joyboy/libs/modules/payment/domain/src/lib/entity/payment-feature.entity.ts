export class PaymentFeatureEntity {}

export enum PaymentMethodProvider {}

/**
 * Payment Provider Enum
 * 支付提供商（唯一标识）
 */
export enum PaymentMethodProviderEnum {
  TWO_C2P = '2c2p',
  GRABPAY = 'grabpay',
  ZIPPAY = 'zippay',
  AFFIRM = 'affirm',
  HOOLAH = 'hoolah',
  BRAINTREE = 'braintree',
  STRIPE_ONLINE = 'stripe-online',
  STRIPE_AFTERPAY = 'stripe-afterpay',
  STRIPE_AFFIRM = 'stripe-affirm',
  STRIPE_KLARNA = 'stripe-klarna',
  STRIPE_PAYMENT_LINK = 'stripe-payment-link',
  STRIPE_APPLE_PAY = 'stripe-apple-pay',
  STRIPE_GOOGLE_PAY = 'stripe-google-pay',
  STRIPE_LINK_PAY = 'stripe-link-pay',
  STRIPE_TERMINAL = 'stripe-terminal',
  STRIPE_INVOICE = 'stripe-invoice',
  STRIPE_OFFLINE = 'stripe-offline',
  PAYPAL_ONLINE = 'paypal-online',
  PAYPAL_INVOICE = 'paypal-invoice',
  OFFLINE_CASH = 'offline-cash',
  OFFLINE_CREDIT_CARD = 'offline-credit-card',
  OFFLINE_TRANSFER = 'offline-transfer',
  OFFLINE_STORE_CREDIT = 'offline-store-credit',
  OFFLINE_CREDIT_MEMO = 'offline-credit-memo',
  OFFLINE_CHEQUE = 'offline-cheque',
  NETS = 'nets',
  SHOPBACK = 'shopback',
  OFFLINE_AMEX_TERM = 'offline-amex-term',
  OFFLINE_OCBC_TERM = 'offline-ocbc-term',
  OFFLINE_DBS_TERM = 'offline-dbs-term',
  OFFLINE_SC_TERM = 'offline-sc-term',
  HOOLAH_V2 = 'hoolah-v2',
  GRABPAY_POS = 'grabpay-pos',
  HOOLAH_QR = 'hoolah-qr',
  LEGACY_PAYMENT_METHOD = 'legacy-payment-method',
}
