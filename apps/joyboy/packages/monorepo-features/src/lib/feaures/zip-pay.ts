import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

/**
 * Zippay configuration
 * zippay inline messaging widget doc:https://developers.zip.co/docs/product-cart-widget#product-page-messaging-implementation
 */
const zipPay: Feature = {
  featureName: FeatureName.ZIP_PAY,
  description: 'ZipPay configuration',
  enabledRegions: [Region.AU, Region.SG],
  enabledAppChannels: [ApplicationChannel.WEB],
  status: true,
  payload: {
    publicKey: Adapters.zipPublicKey,
  },
};

export default zipPay;
