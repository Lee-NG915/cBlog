import { EcEnv } from '@castlery/config';
import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

/**
 * UTT Impact
 *
 * Migrating from GTM-managed UTT/conversion tags to code-managed integration.
 * scriptUrl + conversionEventId injected per-deployment via env
 * (NEXT_PUBLIC_IMPACT_UTT_CDN_URL / NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID).
 * Add a market to enabledRegions after its env values are configured and
 * the corresponding GTM tags have been paused.
 *
 * conversionEventId: numeric id from impact.com dashboard
 *   (Conversions → Online Order Tracking). Empty / 0 = skip trackConversion.
 */
const uttImpact: Feature = {
  featureName: FeatureName.UTT_IMPACT,
  description: 'UTT Impact',
  status: true,
  enabledAppChannels: [ApplicationChannel.WEB, ApplicationChannel.POS],
  enabledRegions: [Region.CA, Region.UK, Region.SG, Region.AU, Region.US],
  payload: {
    scriptUrl: EcEnv.NEXT_PUBLIC_IMPACT_UTT_CDN_URL || '',
    conversionEventId: EcEnv.NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID || '',
  },
};

export default uttImpact;
