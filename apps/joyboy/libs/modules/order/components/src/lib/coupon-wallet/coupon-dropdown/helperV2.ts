import { EcEnv } from '@castlery/config';
import type { YotpoRedemPtionOption } from '@castlery/modules-order-domain';
import dayjs from 'dayjs';
import { CouponItemV2, CouponsContent } from '@castlery/modules-promotion-domain';
export const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY;
/**
 * Calculator Types
 */
export enum CalculatorTypes {
  ALL_FLAT_RATE = 'AllFlatRate',
  ALL_FLAT_PERCENT = 'AllFlatPercent',
  PERCENT_PER_ITEM = 'PercentPerItem',
  TIERED_PERCENT = 'TieredPercent',
  TIERED_FLAT_RATE = 'TieredFlatRate',
  FREE_SHIPPING = 'FreeShipping',
  FREE_ANY_SERVICE = 'FreeAnyService',
  FREE_ROC_SERVICE = 'FreeRocService',
  FREE_WG_SERVICE = 'FreeWgService',
  GIFT_POOLS = 'GiftPools',
}
export type CalculatorType = keyof typeof CalculatorTypes;
export type CalculatorValueType = (typeof CalculatorTypes)[keyof typeof CalculatorTypes];
/**
 * AllFlatRate     amount
 * AllFlatPercent  flat_percent
 * FreeShipping
 * FreeAnyService
 * FreeRocService
 * FreeWgService
 * PercentPerItem  percent
 * GiftPools
 * TieredPercent   tiers
 * TieredFlatRate  tiers
 */
// eslint-disable-next-line
interface Preferences {
  amount?: number;
  tiers?: Record<string, number>;
  flat_percent?: number;
  percent?: number;
  effective_tier?: number;
}

export const defaultResult = {
  title: '',
  description: '',
  descriptionInfo: [],
  isHighest: false,
};

export type CouponType = 'coupon' | 'credits' | 'credits-notice';

interface FormatterReturns extends Omit<CouponItemV2, 'expired_at' | 'content'> {
  highlightedCode: string;
  title: string;
  description: string;
  descriptionInfo: string;
  isHighest: boolean;
  couponType: CouponType;
  cost?: number;
  available: boolean;
  expired_at?: Date;
  min_spend?: number;
  content?: CouponsContent;
  upgradeDescription?: string;
  unavailableReason?: string;
}
export type CouponItemType = FormatterReturns;

export const formatter = (coupons: CouponItemV2[]): FormatterReturns[] => {
  if (!coupons?.length) return [];
  return coupons.reduce((acc: any, cur: any) => {
    const { code, voucherTime, content } = cur;
    const data = {
      ...cur,
      highlightedCode: code,
      title: content?.discountDescription,
      isHighest: false,
      couponType: 'coupon',
      expired_at: voucherTime?.endTime ? new Date(voucherTime.endTime) : undefined,
      upgradeDescription: content?.upgradeDescription,
    };

    return [...acc, data];
  }, []);
};

export const checkEligible = ({ available, expired_at }: { available: boolean; expired_at?: Date }) => {
  return typeof available === 'boolean' ? available : expired_at ? dayjs().isBefore(dayjs(expired_at)) : false;
};

export const highlightFormattedText = (data: string, query: string) => {
  const reg = new RegExp(query, 'ig');
  if (data) {
    return data.replace(reg, (match) => `<strong>${match}</strong>`);
  }
  return null;
};

export const formatterRedeemOptions = (redeemOptions: YotpoRedemPtionOption[], points = 0): FormatterReturns[] => {
  const noticeItem = {
    couponType: 'credits-notice',
    id: 0,
  } as FormatterReturns;
  if (!redeemOptions?.length || points <= 0) return [noticeItem as FormatterReturns];
  const realOptions = redeemOptions.filter((option) => option.amount <= points);
  const options = realOptions.reduce((acc: any, cur: any) => {
    const { id, name, amount, description } = cur;
    const item = {
      id,
      couponType: 'credits',
      title: name,
      cost: amount, // The number of points required to redeem this option
      min_spend: description?.split('Min. spend $')?.[1],
      expired_at: dayjs().add(31, 'day').toDate(), //getDate().add(31, 'day'),
    };
    return [...acc, item];
  }, []);

  return Array.isArray(options) ? [noticeItem, ...options] : [noticeItem];
};
