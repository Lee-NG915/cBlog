// https://stripe.com/docs/stripe-js/elements/payment-request-button?html-or-react=html#verifying-your-domain-with-apple-pay
export const PAYMENT_METHOD = {
  applePay: 'Apple Pay',
  googlePay: 'Google Pay',
  afterPay: 'Stripe AfterPay',
  link: 'Link',
};

export const WALLETS_PAYMENT_METHOD = [PAYMENT_METHOD.applePay, PAYMENT_METHOD.googlePay, PAYMENT_METHOD.link];
