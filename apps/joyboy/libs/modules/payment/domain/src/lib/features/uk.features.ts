import { PaymentFeatureEntity } from '../entity/payment-feature.entity';
import { SupportedPaymentMethods } from './base.features';

export class UKFeatures extends PaymentFeatureEntity {
  supportedPaymentMethods: SupportedPaymentMethods[] = Object.values(SupportedPaymentMethods);
}
