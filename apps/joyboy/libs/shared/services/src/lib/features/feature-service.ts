import { AUFeatures } from './au';
import { CAFeatures } from './ca';
import { SGFeatures } from './sg';
import { UKFeatures } from './uk';
import { USFeatures } from './us';
import { EcEnv, getWarrantyRuntimeConfig as getConfigWarrantyRuntimeConfig } from '@castlery/config';
import { featureManager, getWarrantyProvider } from '@castlery/monorepo-features';

const getRegionalFeatures = (country: string) => {
  const upperCountry = country?.toUpperCase();
  switch (upperCountry) {
    case 'AU':
      return AUFeatures;
    case 'CA':
      return CAFeatures;
    case 'SG':
      return SGFeatures;
    case 'UK':
      return UKFeatures;
    case 'US':
      return USFeatures;
    default:
      return {
        enabledOrderV2: false,
        enabledPosUmsAuth: false,
        enableHardCodedFreeShippingLimit: false,
        hardCodedFreeShippingLimit: 0,
      };
  }
};

export const sharedFeatureService = {
  getWarrantyProvider,
  getWarrantyRuntimeConfig: () => getConfigWarrantyRuntimeConfig(getWarrantyProvider()),
  isGuardsmanEnabled: () => {
    return sharedFeatureService.getWarrantyProvider() === 'guardsman';
  },
  isMulberryEnabled: () => {
    return sharedFeatureService.getWarrantyProvider() === 'mulberry';
  },
  getMulberryPayload: () => {
    return featureManager.getFeatureFlagPayload(featureManager.featureName.MULBERRY);
  },
  getGuardsmanPayload: () => {
    return featureManager.getFeatureFlagPayload(featureManager.featureName.GUARDSMAN);
  },
  ...getRegionalFeatures(EcEnv.NEXT_PUBLIC_COUNTRY),
};
