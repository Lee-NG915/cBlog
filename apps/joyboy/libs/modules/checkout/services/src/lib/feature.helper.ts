import { EcEnv } from '@castlery/config';
import {
  type CheckoutBusinessFeature,
  SGMarketFeature,
  UKMarketFeature,
  CAMarketFeature,
  USMarketFeature,
  AUMarketFeature,
} from '@castlery/modules-checkout-domain';

export const getMarketFeature = (): CheckoutBusinessFeature => {
  const market = EcEnv.NEXT_PUBLIC_COUNTRY;
  switch (market) {
    case 'SG':
      return SGMarketFeature;
    case 'UK':
      return UKMarketFeature;
    case 'CA':
      return CAMarketFeature;
    case 'US':
      return USMarketFeature;
    case 'AU':
      return AUMarketFeature;
    default:
      throw new Error(`[checkoutFeatureService]Unsupported market: ${market}`);
  }
};
export const checkoutFeatureService = {
  ...getMarketFeature(),
};
