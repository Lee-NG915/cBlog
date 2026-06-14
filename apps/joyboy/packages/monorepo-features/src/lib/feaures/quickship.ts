import { FeatureName, Region, ApplicationChannel } from '../config';
import type { Feature } from '../types';

const quickship: Feature = {
  featureName: FeatureName.QUICKSHIP,
  description: 'Quickship toggle refinement for fast shipping products',
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.US, Region.CA],
  status: true,
};

export default quickship;
