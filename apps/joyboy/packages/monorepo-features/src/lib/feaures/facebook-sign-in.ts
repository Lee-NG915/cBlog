import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

/**
 * Facebook Sign In
 * npm package: `react-facebook-login`
 * https://github.com/keppelen/react-facebook-login/blob/cbcabc595d3c6b0339dc91bc86af4681972c7763/src/facebook.js#L139
 */
const fbSign: Feature = {
  featureName: FeatureName.FACEBOOK_SIGN_IN,
  description: 'Sign in with Facebook',
  status: !!Adapters.facebookClientId,
  enabledRegions: [Region.SG, Region.US, Region.AU],
  enabledAppChannels: [ApplicationChannel.WEB],
  payload: {
    clientAppId: Adapters.facebookClientId,
    version: '6.0',
    icon: '',
  },
};

export default fbSign;
