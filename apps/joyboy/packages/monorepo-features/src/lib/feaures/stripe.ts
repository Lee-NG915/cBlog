import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

/**
 * Feature Stripe
 * The usage scenarios and development documents are as follows:
 * Credit card payments with Stripe:
 * - https://docs.stripe.com/js/payment_methods/create_payment_method
 * Payment Request Button for Apple Pay and Google Pay and link to the Stripe Checkout:
 * - https://docs.stripe.com/stripe-js/elements/payment-request-button?html-or-react=html#verifying-your-domain-with-apple-pay
 */
const stripe: Feature = {
  featureName: FeatureName.STRIPE,
  description: 'Stripe: One of the payment methods',
  enabledRegions: [Region.SG, Region.US, Region.AU, Region.CA],
  enabledAppChannels: [ApplicationChannel.WEB],
  status: true,
};

export default stripe;
