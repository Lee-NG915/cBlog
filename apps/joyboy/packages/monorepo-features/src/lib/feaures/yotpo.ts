import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const payload: Partial<
  Record<
    Region,
    {
      enabled: true;
      customActionsMapping?: {
        // 在yotpo的后台配置的action name
        [key: string]: string;
      };
      templates?: {
        [key: string]: string;
      };
    }
  >
> = {
  [Region.SG]: {
    enabled: true,
    customActionsMapping: {
      ScanQRCodeFromOfflineShowroom: Adapters.isProductionEnv
        ? 'Scan QR Code To View Product'
        : 'Scan QR Code To View Product Test',
    },
    templates: {
      rewards: Adapters.isProductionEnv ? '98072' : '12345',
    },
  },
  [Region.US]: {
    enabled: true,
    customActionsMapping: {
      ScanQRCodeFromOfflineShowroom: 'Scan QR Code To View Product',
    },
  },
  [Region.CA]: {
    enabled: true,
  },
  [Region.AU]: {
    enabled: true,
  },
  [Region.UK]: {
    enabled: true,
  },
};

const yotpo: Feature = {
  featureName: FeatureName.YOTPO,
  description: 'Yotpo integration',
  enabledAppChannels: [ApplicationChannel.WEB, ApplicationChannel.POS],
  enabledRegions: [Region.SG, Region.US, Region.CA, Region.AU, Region.UK],
  status: true,
  payload,
};

export default yotpo;
