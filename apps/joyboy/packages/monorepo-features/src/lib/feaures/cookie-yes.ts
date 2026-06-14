import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';

/**
 * CMP (Consent Management Platform)
 * @todo :现在在使用环境变量限制，后续迁移到feature flag管理
 */
const cookieYes: Feature = {
  featureName: FeatureName.COOKIE_YES,
  description: 'Consent Management Platform',
  status: true,
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.CA, Region.US, Region.UK],
  payload: {},
};

export default cookieYes;
