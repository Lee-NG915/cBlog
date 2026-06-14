import { EcEnv } from '@castlery/config';
import type { CouponItemV1 } from '@castlery/modules-order-domain';
import { toPrice } from '@castlery/utils';
import dayjs from 'dayjs';

export const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY;

export const tieredDiscountFunc = ({ tiers = {}, effective_tier }: Preferences, from: string, isTiredFlat = false) => {
  const fromCart = from === 'cart';
  let isHighest = false;
  let title = '';

  if (fromCart) {
    const lastTier = Object.values(tiers)?.pop();
    isHighest = lastTier === effective_tier;
    title = effective_tier
      ? `${toPrice(effective_tier)}${isTiredFlat ? '' : '%'} OFF`
      : `${toPrice(Object.values(tiers)[0])}${isTiredFlat ? '' : '%'} OFF`;
  } else {
    title = `${Object.values(tiers)
      ?.map((tier) => (isTiredFlat ? `${toPrice(+tier)}` : `${+tier}%`))
      .join('/')}`;
  }
  return {
    ...defaultResult,
    title,
    isHighest,
    description: 'Tiered Discount',
    descriptionInfo:
      Object.entries(tiers)?.map(([key, value]) =>
        isTiredFlat
          ? `${toPrice(+value)} OFF Min. Spend ${toPrice(+key)}`
          : `${+value}% OFF Min. Spend ${toPrice(+key)}`
      ) || [],
  };
};
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
interface Preferences {
  amount?: number;
  tiers?: Record<string, number>;
  flat_percent?: number;
  percent?: number;
  effective_tier?: number;
}

interface MapReturnsResult {
  title: string;
  description: string;
  descriptionInfo: string[];
  isHighest: boolean;
}
export const defaultResult = {
  title: '',
  description: '',
  descriptionInfo: [],
  isHighest: false,
};
export const calculatorMap = new Map<CalculatorValueType, (args: Preferences, from: string) => MapReturnsResult>([
  [
    CalculatorTypes.ALL_FLAT_RATE,
    ({ amount = '0' }) => ({
      ...defaultResult,
      title: toPrice(Number(amount)),
    }),
  ],
  [
    CalculatorTypes.ALL_FLAT_PERCENT,
    ({ flat_percent }) => {
      return {
        ...defaultResult,
        title: flat_percent ? `${+flat_percent}% OFF` : '0% OFF',
      };
    },
  ],
  [
    CalculatorTypes.PERCENT_PER_ITEM,
    ({ percent = 0 }) => {
      return {
        ...defaultResult,
        title: `${+percent}% OFF Per Item`,
      };
    },
  ],
  [
    CalculatorTypes.TIERED_PERCENT, //TIERED_FLAT_RATE is the same
    (args, from) => tieredDiscountFunc(args, 'voucher', false),
  ],
  [
    CalculatorTypes.TIERED_FLAT_RATE, //TIERED_PERCENT is the same
    (args, from) => tieredDiscountFunc(args, 'voucher', true),
  ],
  [
    CalculatorTypes.FREE_SHIPPING,
    () => {
      return {
        ...defaultResult,
        title: 'Free Shipping',
      };
    },
  ],
  [
    CalculatorTypes.FREE_ANY_SERVICE,
    () => {
      return {
        ...defaultResult,
        title: __COUNTRY__ === 'SG' ? 'Free Service' : 'Free WG & ROC service',
      };
    },
  ],
  [
    CalculatorTypes.FREE_ROC_SERVICE,
    () => {
      return {
        ...defaultResult,
        title: 'Free ROC Service',
      };
    },
  ],
  [
    CalculatorTypes.FREE_WG_SERVICE,
    () => {
      return {
        ...defaultResult,
        title: 'Free WG Service',
      };
    },
  ],
  [
    CalculatorTypes.GIFT_POOLS,
    () => {
      return {
        ...defaultResult,
        title: 'Free Gift(s)',
      };
    },
  ],
]);

export const formatPreferences = (type: CalculatorValueType, preferences: Preferences, from = 'voucher') =>
  calculatorMap.get(type)?.(preferences, from) || defaultResult;

export type CouponType = 'coupon' | 'credits' | 'credits-notice';

interface FormatterReturns extends Omit<CouponItemV1, 'calculators'> {
  highlightedCode: string;
  calculators: {
    title: string;
    description: string;
    descriptionInfo: string;
    isHighest: boolean;
  }[];
  title: string;
  description: string;
  descriptionInfo: string;
  isHighest: boolean;
  couponType: CouponType;
  cost?: number;
}
export type CouponItemType = FormatterReturns;

export const formatter = (coupons: CouponItemV1[]): FormatterReturns[] => {
  if (!coupons?.length) return [];
  return coupons.reduce((acc, cur) => {
    const { calculators } = cur;
    if (!calculators?.length) {
      return [...acc, { ...cur, couponType: 'coupon' }];
    }
    const newCal = calculators.map((item) => {
      const { type, preferences } = item || {};
      const { title, description, descriptionInfo, isHighest } = formatPreferences(type, preferences, 'cart');
      return {
        ...item,
        title,
        description,
        descriptionInfo,
        isHighest,
      };
    });
    const title = newCal.map((item) => item.title)?.join(' & ');

    const data = {
      ...cur,
      highlightedCode: cur.code,
      calculators: newCal,
      title,
      description: newCal.length > 1 ? '' : newCal[0]?.description,
      descriptionInfo: newCal.length > 1 ? title : newCal[0]?.descriptionInfo,
      isHighest: newCal.length === 1 && newCal[0]?.isHighest,
      couponType: 'coupon',
    };
    return [...acc, data];
  }, []);
};

export const checkEligible = ({ available, expired_at }: { available: boolean; expired_at?: string }) => {
  return typeof available === 'boolean' ? available : expired_at ? dayjs().isBefore(dayjs(expired_at)) : false;
};
