export const POS_UMS_MARKETS = ['SG', 'US', 'AU', 'CA', 'UK'] as const;

export type PosUmsMarketCode = (typeof POS_UMS_MARKETS)[number];

export type PosUmsPermissionStatus = 'idle' | 'loading' | 'ready' | 'unauthenticated' | 'error';

export type PosUmsPermissionRequirement =
  | string
  | {
      anyOf: string[];
    }
  | {
      allOf: string[];
    };

export type PosUmsPermissionState = {
  status: PosUmsPermissionStatus;
  market: PosUmsMarketCode | null;
  permissions: string[];
  loadedAt?: number;
  error?: string;
};

export function isPosUmsMarketCode(value: string): value is PosUmsMarketCode {
  return POS_UMS_MARKETS.includes(value as PosUmsMarketCode);
}
