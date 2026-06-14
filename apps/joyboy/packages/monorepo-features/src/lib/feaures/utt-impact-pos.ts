import { EcEnv } from '@castlery/config';
import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

/**
 * UTT Impact (POS)
 *
 * POS 端 impact.com 集成：仅 SG / AU / US 三个市场启用。
 * POS 无 CookieYes / consent banner，consent 一次性下发 `default: granted`。
 *
 * scriptUrl + conversionEventId injected per-deployment via env
 * (NEXT_PUBLIC_IMPACT_UTT_CDN_URL / NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID).
 *
 * conversionEventId: numeric id from impact.com dashboard
 *   (Conversions → Online Order Tracking). Empty / 0 = skip trackConversion.
 */
const uttImpactPos: Feature = {
  featureName: FeatureName.UTT_IMPACT_POS,
  description: 'UTT Impact (POS)',
  status: true,
  enabledAppChannels: [ApplicationChannel.POS],
  enabledRegions: [Region.SG, Region.AU, Region.US],
  payload: {
    scriptUrl: EcEnv.NEXT_PUBLIC_IMPACT_UTT_CDN_URL || '',
    conversionEventId: EcEnv.NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID || '',
  },
};

export default uttImpactPos;
