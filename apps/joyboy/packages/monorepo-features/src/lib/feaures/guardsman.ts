import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const guardsman: Feature = {
  featureName: FeatureName.GUARDSMAN,
  description: 'Guardsman',
  enabledRegions: [Region.CA],
  enabledAppChannels: [ApplicationChannel.WEB, ApplicationChannel.POS],
  status: !!Adapters.guardsmanPublicKey && !!Adapters.guardsmanWidgetSdk,
  payload: {
    guardsmanPublicKey: Adapters.guardsmanPublicKey,
    guardsmanWidgetSdk: Adapters.guardsmanWidgetSdk,
  },
};

export default guardsman;
