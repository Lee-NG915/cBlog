import { EcEnv } from '@castlery/config';
import {
  AUFeature,
  CAFeature,
  SGFeature,
  UKFeature,
  USFeature,
  type TrackingFeature,
} from '@castlery/modules-tracking-domain';

export const getTrackingFeature = (): TrackingFeature => {
  const market = EcEnv.NEXT_PUBLIC_COUNTRY;
  switch (market) {
    case 'AU':
      return AUFeature;
    case 'CA':
      return CAFeature;
    case 'SG':
      return SGFeature;
    case 'UK':
      return UKFeature;
    case 'US':
      return USFeature;
    default:
      throw new Error(`[getTrackingFeature]Unsupported market: ${market}`);
  }
};

export const trackingFeatureService = {
  ...getTrackingFeature(),
};
