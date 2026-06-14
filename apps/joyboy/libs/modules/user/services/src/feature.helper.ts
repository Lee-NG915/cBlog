import {
  AUMarketFeatures,
  CAMarketFeatures,
  SGMarketFeatures,
  UKMarketFeatures,
  USMarketFeatures,
} from '@castlery/modules-user-domain';
import type { UserBusinessFeatures } from '@castlery/modules-user-domain';
import { exportAllClassProperties } from '@castlery/utils';
import { EcEnv } from '@castlery/config';
import { featureManager } from '@castlery/monorepo-features';

export const getMarketFeatures = (market: string) => {
  switch (market) {
    case 'AU':
      return new AUMarketFeatures();
    case 'CA':
      return new CAMarketFeatures();
    case 'SG':
      return new SGMarketFeatures();
    case 'UK':
      return new UKMarketFeatures();
    case 'US':
      return new USMarketFeatures();
    default:
      throw new Error(`[Error][User Feature Service]: Market ${market} not supported`);
  }
};

const regionalFeature = getMarketFeatures(EcEnv.NEXT_PUBLIC_COUNTRY);

export const userFeatureService: UserBusinessFeatures = {
  ...exportAllClassProperties(regionalFeature),
  isEnabledAppleSignin: featureManager.isFeatureEnabled(featureManager.featureName.APPLE_SIGN_IN),
  isEnabledGoogleSignin: featureManager.isFeatureEnabled(featureManager.featureName.GOOGLE_SIGN_IN),
  isEnabledFacebookSignin: featureManager.isFeatureEnabled(featureManager.featureName.FACEBOOK_SIGN_IN),
  getAppleSigninPayload: featureManager.getFeatureFlagPayload(featureManager.featureName.APPLE_SIGN_IN),
  getGoogleSigninPayload: featureManager.getFeatureFlagPayload(featureManager.featureName.GOOGLE_SIGN_IN),
  getFacebookSigninPayload: featureManager.getFeatureFlagPayload(featureManager.featureName.FACEBOOK_SIGN_IN),
};

// console.log(userFeatureService.addressFormFields);
