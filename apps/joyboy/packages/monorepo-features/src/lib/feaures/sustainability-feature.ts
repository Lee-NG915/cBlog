import { FeatureName, Region, ApplicationChannel } from '../config';
import type { Feature } from '../types';

const sustainabilityFeature: Feature = {
  featureName: FeatureName.SUSTAINABILITY_FEATURE,
  description: 'Sustainability feature facet filter for eco-friendly products',
  enabledAppChannels: [ApplicationChannel.WEB, ApplicationChannel.POS],
  enabledRegions: [Region.SG],
  status: true,
};

export default sustainabilityFeature;
