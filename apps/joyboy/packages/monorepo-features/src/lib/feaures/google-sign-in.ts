import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

/**
 * Google Sign In
 */
const googleSign: Feature = {
  featureName: FeatureName.GOOGLE_SIGN_IN,
  description: 'Sign in with Google',
  status: !!Adapters.googleClientId,
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.SG, Region.US, Region.AU],
  payload: {
    clientId: Adapters.googleClientId,
    jsScriptUrl: 'https://accounts.google.com/gsi/client',
    icon: '',
  },
};

export default googleSign;
