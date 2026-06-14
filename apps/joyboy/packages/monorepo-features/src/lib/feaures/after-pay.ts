import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

/**
 * Feature Afterpay
 * The usage scenarios and development documents are as follows:
 * Afterpay: One of the payment methods,Powered by Stripe
 * https://docs.stripe.com/payments/afterpay-clearpay/accept-a-payment?platform=web&ui=API#web-submit-payment
 */
const afterPay: Feature = {
  featureName: FeatureName.AFTER_PAY,
  description: 'AfterPay: One of the payment methods,Powered by Stripe',
  enabledRegions: [Region.AU, Region.SG],
  enabledAppChannels: [ApplicationChannel.WEB],
  status: true,
};

export default afterPay;
