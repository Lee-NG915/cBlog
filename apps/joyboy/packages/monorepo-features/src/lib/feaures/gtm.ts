import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const gtm: Feature = {
  featureName: FeatureName.GTM,
  description: 'Google Tag Manager',
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.US, Region.AU, Region.SG, Region.CA, Region.UK],
  status: !!Adapters.gtmIds,
  payload: {},
};

export default gtm;
