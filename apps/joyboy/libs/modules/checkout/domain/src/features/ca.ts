import { CheckoutBusinessFeature } from '../entity/business-feature.entity';
import { EcEnv } from '@castlery/config';

const origin = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME || 'https://www.castlery.com';

export const CAMarketFeature: CheckoutBusinessFeature = {
  termsAndConditionsUrl: `${origin}/ca/sales-and-refunds`,
  googlePlaceEnabledInSearchAddress: true,
  enabledAccumulativeServiceFee: false,
  enableGoogleCustomerReviews: true,
};
