import { PaymentFeatureEntity } from '../entity/payment-feature.entity';
import { SupportedPaymentMethods } from './base.features';

export class CAFeatures extends PaymentFeatureEntity {
  supportedPaymentMethods: SupportedPaymentMethods[] = Object.values(SupportedPaymentMethods);
}
