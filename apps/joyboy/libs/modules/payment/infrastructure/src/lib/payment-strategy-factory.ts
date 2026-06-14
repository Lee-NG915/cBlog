import 'server-only';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import type { IPaymentStrategy, IPaymentStrategyFactory } from '@castlery/modules-payment-domain';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { GrabPayStrategy } from './strategies/grabpay.strategy';
import { TwoCTwoPStrategy } from './strategies/twoctop.strategy';
import { ZipPayStrategy } from './strategies/zippay.strategy';
import { AffirmStrategy } from './strategies/affirm.strategy';

type StrategyCreator = (traceId: string) => IPaymentStrategy;

/**
 * Registry that maps each PaymentMethodProviderEnum to its Strategy constructor.
 * To add a new payment provider, register it here — no other code needs to change.
 *
 * Stripe covers all Stripe-based methods (credit card, Apple/Google Pay,
 * AfterPay, Affirm via Stripe, Link) since they share the same API flow.
 */
export class PaymentStrategyFactory implements IPaymentStrategyFactory {
  private readonly registry: Map<PaymentMethodProviderEnum, StrategyCreator>;

  constructor() {
    this.registry = new Map<PaymentMethodProviderEnum, StrategyCreator>([
      [
        PaymentMethodProviderEnum.STRIPE_ONLINE,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_ONLINE),
      ],
      [
        PaymentMethodProviderEnum.STRIPE_AFTERPAY,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_AFTERPAY),
      ],
      [
        PaymentMethodProviderEnum.STRIPE_AFFIRM,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_AFFIRM),
      ],
      [
        PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_APPLE_PAY),
      ],
      [
        PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY),
      ],
      [
        PaymentMethodProviderEnum.STRIPE_LINK_PAY,
        (traceId) => new StripeStrategy(traceId, PaymentMethodProviderEnum.STRIPE_LINK_PAY),
      ],
      [PaymentMethodProviderEnum.PAYPAL_ONLINE, (traceId) => new PaypalStrategy(traceId)],
      [PaymentMethodProviderEnum.GRABPAY, (traceId) => new GrabPayStrategy(traceId)],
      [PaymentMethodProviderEnum.TWO_C2P, (traceId) => new TwoCTwoPStrategy(traceId)],
      [PaymentMethodProviderEnum.ZIPPAY, (traceId) => new ZipPayStrategy(traceId)],
      [PaymentMethodProviderEnum.AFFIRM, (traceId) => new AffirmStrategy(traceId)],
    ]);
  }

  get(provider: PaymentMethodProviderEnum, traceId: string): IPaymentStrategy {
    const factory = this.registry.get(provider);
    if (!factory) {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
    return factory(traceId);
  }
}
