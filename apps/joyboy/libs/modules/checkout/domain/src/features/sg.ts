import { CheckoutBusinessFeature } from '../entity/business-feature.entity';
import { EcEnv } from '@castlery/config';

const origin = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME || 'https://www.castlery.com';

export const SGMarketFeature: CheckoutBusinessFeature = {
  termsAndConditionsUrl: `${origin}/sg/sales-and-refunds`,
  googlePlaceEnabledInSearchAddress: false,
  enabledAccumulativeServiceFee: false,
  enableGoogleCustomerReviews: false,
};
