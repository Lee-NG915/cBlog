import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const mulberry: Feature = {
  featureName: FeatureName.MULBERRY,
  description: 'Mulberry',
  enabledRegions: [Region.US],
  enabledAppChannels: [ApplicationChannel.WEB, ApplicationChannel.POS],
  status: !!Adapters.mulberryToken && !!Adapters.mulberrySdk,
  payload: {
    mulberryToken: Adapters.mulberryToken,
    mulberrySdk: Adapters.mulberrySdk,
  },
};

export default mulberry;
