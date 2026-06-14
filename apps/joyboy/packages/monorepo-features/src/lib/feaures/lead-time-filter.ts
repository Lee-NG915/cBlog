import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { EcEnv } from '@castlery/config';

// Type definition for lead time group item
interface LeadTimeGroupItem {
  label: string;
  start: number;
  end?: number;
}

// Lead time group configurations for different regions
const LEAD_TIME_GROUP_CONFIG: Record<string, LeadTimeGroupItem[]> = {
  SG: [
    // { label: 'in 2 working days', start: 0, end: 3 },
    { label: '1 - 2 weeks', start: 3, end: 15 },
    { label: '3 - 5 weeks', start: 15, end: 36 },
    { label: '6 - 8 weeks', start: 36, end: 57 },
    { label: '9 weeks +', start: 57 },
  ],
  common: [
    { label: 'Ready To Ship', start: 0, end: 15 },
    // { label: 'in 2 business days', start: 0, end: 3 },
    { label: 'in 1 week', start: 3, end: 8 },
    { label: '1 - 2 weeks', start: 8, end: 15 },
    { label: '2 - 3 weeks', start: 15, end: 22 },
    { label: '3 - 4 weeks', start: 22, end: 29 },
    { label: '4 - 6 weeks', start: 29, end: 43 },
    { label: '7 - 9 weeks', start: 43, end: 64 },
    { label: '10 weeks +', start: 64 },
  ],
};

// Region-specific payload configuration
const payload: Partial<
  Record<
    Region,
    {
      enabled: boolean;
      leadTimeGroups: LeadTimeGroupItem[];
    }
  >
> = {
  [Region.SG]: {
    enabled: true,
    leadTimeGroups: LEAD_TIME_GROUP_CONFIG['SG'],
  },
  [Region.US]: {
    enabled: false, // US doesn't show lead time filter
    leadTimeGroups: LEAD_TIME_GROUP_CONFIG['common'],
  },
  [Region.AU]: {
    enabled: true,
    leadTimeGroups: LEAD_TIME_GROUP_CONFIG['common'],
  },
  [Region.CA]: {
    enabled: true,
    leadTimeGroups: LEAD_TIME_GROUP_CONFIG['common'],
  },
  [Region.UK]: {
    enabled: true,
    leadTimeGroups: LEAD_TIME_GROUP_CONFIG['common'],
  },
};

const leadTimeFilter: Feature = {
  featureName: FeatureName.LEAD_TIME_FILTER,
  description: 'Lead time filter configuration and visibility control',
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.SG, Region.AU, Region.CA, Region.UK], // US is excluded from enabled regions
  status: true,
  payload: payload[EcEnv.NEXT_PUBLIC_COUNTRY],
};

export default leadTimeFilter;
