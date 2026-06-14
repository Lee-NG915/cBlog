import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

const grabPay: Feature = {
  featureName: FeatureName.GRAB_PAY,
  description: 'GrabPay configuration',
  enabledRegions: [Region.SG],
  enabledAppChannels: [ApplicationChannel.WEB],
  status: true,
};

export default grabPay;
