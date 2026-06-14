import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const paypal: Feature = {
  featureName: FeatureName.PAYPAL,
  description: 'Paypal configuration',
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.SG, Region.US, Region.AU],
  status: true,
  payload: {
    clientId: Adapters.paypalClientId,
  },
};

export default paypal;
