import { CheckoutBusinessFeature } from '../entity/business-feature.entity';
import { EcEnv } from '@castlery/config';

const origin = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME || 'https://www.castlery.com';

export const AUMarketFeature: CheckoutBusinessFeature = {
  termsAndConditionsUrl: `${origin}/au/sales-and-refunds`,
  googlePlaceEnabledInSearchAddress: true,
  enabledAccumulativeServiceFee: true,
  enableGoogleCustomerReviews: false,
};
