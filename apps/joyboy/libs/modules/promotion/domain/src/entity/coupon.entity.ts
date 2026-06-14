export interface CouponCalculator {
  type: string;
  preferences: Preferences;
}

export interface Preferences {
  base_percent: string;
  tiers: Tiers;
  effective_tier: string;
}

export interface Tiers {
  [keyName: string]: string;
}

export enum CouponStateEnum {
  //  0: available, 1: unavailable, 2: expired, 3: used
  AVAILABLE = 0,
  UNAVAILABLE = 1,
  EXPIRED = 2,
  USED = 3,
}
export { VoucherType } from '@castlery/types';

export interface CouponItemV2 {
  id: number;
  code: string;
  name: string;
  state: CouponStateEnum;
  version: string;
  voucherType: string;
  available: boolean;
  voucherTime: CouponsVoucherTime;
  content: CouponsContent;
}

export interface CouponsVoucherTime {
  startTime: number;
  endTime: number;
}

export interface CouponsContent {
  discountDescription: string;
  unavailableReason: string;
  upgradeDescription: string;
  usingRuleDescription: string;
  usingRuleDetail: string;
}
