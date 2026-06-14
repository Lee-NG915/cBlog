import { VoucherType } from '@castlery/types';

export enum CouponWalletOptionType {
  COUPON = 'coupon',
  CREDITS = 'credits',
}

export interface CouponWalletOption {
  label: string;
  value: string;
  ruleDescription: string;
  discountDescription: string;
  unavailableReason: string;
  upgradeDescription: string;
  usingRuleDetail: string;
  expiredAt: string;
  type: CouponWalletOptionType;
  state: number; // 0: available, 1: unavailable, 2: expired, 3: used
  cost?: number;
  voucherType: VoucherType;
}
