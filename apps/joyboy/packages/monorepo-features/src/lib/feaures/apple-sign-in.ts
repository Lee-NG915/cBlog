import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

/**
 * Apple Sign In
 */
const appleSign: Feature = {
  featureName: FeatureName.APPLE_SIGN_IN,
  description: 'Sign in with Apple',
  status: !!Adapters.appleClientId,
  enabledRegions: [Region.SG, Region.US, Region.AU],
  enabledAppChannels: [ApplicationChannel.WEB],
  payload: {
    jsSdkUrl: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    clientId: Adapters.appleClientId,
    icon: '',
  },
};

export default appleSign;
