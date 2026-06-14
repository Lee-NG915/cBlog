import {
  AUFeatures,
  CAFeatures,
  PaymentMethodProviderEnum,
  SGFeatures,
  UKFeatures,
  USFeatures,
} from '@castlery/modules-payment-domain';
import { EcEnv } from '@castlery/config';
import { paymentMethodMapping, paymentMethodStaticSettings } from './payment.helper';

export const getFeature = (country: string) => {
  switch (country) {
    case 'AU':
      return new AUFeatures();
    case 'CA':
      return new CAFeatures();
    case 'SG':
      return new SGFeatures();
    case 'UK':
      return new UKFeatures();
    case 'US':
      return new USFeatures();
    default:
      throw new Error(`Country ${country} is not supported`);
  }
};

export const paymentFeatureService = {
  getSupportedPaymentMethods: () => {
    const feature = getFeature(EcEnv.NEXT_PUBLIC_COUNTRY);
    const payments = feature.supportedPaymentMethods;
    return payments?.map((payment) => paymentMethodMapping[payment]).filter((payment) => payment.enabled) || [];
  },
  getPaymentMethodStaticSettings: () => {
    return Object.keys(paymentMethodStaticSettings).map((key: PaymentMethodProviderEnum) => {
      return {
        ...paymentMethodStaticSettings[key],
        provider: key,
      };
    });
  },
};
