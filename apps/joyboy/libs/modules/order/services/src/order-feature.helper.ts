import {
  SGMarket,
  USMarket,
  UKMarket,
  AUMarket,
  CAMarket,
  OrderBusinessFeatures,
} from '@castlery/modules-order-domain';
import { EcEnv } from '@castlery/config';
// import { featureManager, FeatureName } from '@castlery/monorepo-features';

class MarketFactory {
  static getMarket(market: typeof EcEnv.NEXT_PUBLIC_COUNTRY): OrderBusinessFeatures {
    switch (market) {
      case 'SG':
        return SGMarket;
      case 'US':
        return USMarket;
      case 'AU':
        return AUMarket;
      case 'CA':
        return CAMarket;
      case 'UK':
        return UKMarket;
      default:
        throw new Error('Invalid market');
    }
  }
}

// class DomainFeatureService {
//   static isFeatureEnabled(featureName: FeatureName): boolean {
//     return featureManager.isFeatureEnabled(featureName);
//   }
//   static getFeatureFlagPayload(featureName: FeatureName) {
//     return featureManager.getFeatureFlagPayload(featureName);
//   }
// }

export const orderFeatureService = {
  ...MarketFactory.getMarket(EcEnv.NEXT_PUBLIC_COUNTRY),
};
