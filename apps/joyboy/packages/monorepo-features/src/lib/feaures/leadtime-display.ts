import { FeatureName, Region, ApplicationChannel } from '../config';
import type { Feature } from '../types';

const leadtimeDisplay: Feature = {
  featureName: FeatureName.LEADTIME_DISPLAY,
  description: 'Lead time display feature for product cards showing warehouse departure information',
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.SG, Region.AU, Region.UK],
  status: true,
};

export default leadtimeDisplay;
