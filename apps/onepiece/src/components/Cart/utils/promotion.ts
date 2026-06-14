import React from 'react';
import { get } from 'helpers/Cookie';
import { isOutdated } from 'utils/time';

interface DiscountStrategy {
  off: number;
  increment: number;
  minLimit: number;
  maxLimit: number;
}
export const calcDiscount = ({ off, increment, minLimit, maxLimit }: DiscountStrategy, total: number) => {
  if (typeof off !== 'number' || off <= 0 || typeof increment !== 'number' || increment <= 0 || minLimit > maxLimit) {
    return null;
  }
  if (total < maxLimit) {
    const m = parseInt(`${total / increment}`) + 1;
    return {
      limit: m * increment,
      label: `$${off * m} off`,
    };
  }
  return null;
};

/**
 * Store-wide campaigns data
 * @param {*} campaigns
 */
type ActivityType = 'store-wide-campaigns' | 'free-shipping' | 'gift-promotion';
interface ResultItem {
  type: ActivityType;
  limit: number;
  title?: () => string | React.ReactElement;
  label: string | string[];
  campaignName?: string;
  [key: string]: any;
}
interface DiscountData {
  limit: number;
  label: string;
  discountStrategy?: DiscountStrategy;
  icon?: string;
}
interface SWCampaigns<T extends DiscountData = DiscountData> {
  campaignName: string;
  discounts: T[];
  startDate: string;
  endDate: string;
  link?: string;
}

export const storeWideCampaigns = (campaigns: SWCampaigns[], total: number): ResultItem[] => {
  const insiderIndex = get('castlery_insider'); // judge cookie for test
  const currentCampaign =
    typeof insiderIndex === 'string' && ['0', '1', '2', '3'].includes(insiderIndex)
      ? campaigns[parseInt(insiderIndex)]
      : campaigns.find((campaign) => !isOutdated(campaign.startDate, campaign.endDate));
  if (!currentCampaign) {
    return [];
  }
  const { campaignName, discounts, link } = currentCampaign;
  return Array.isArray(discounts)
    ? discounts.reduce((acr: ResultItem[], cur: DiscountData) => {
        if (cur.discountStrategy) {
          const discount = calcDiscount(cur.discountStrategy, total);
          if (discount) {
            return [
              ...acr,
              {
                type: 'store-wide-campaigns',
                limit: discount.limit,
                label: discount.label,
                campaignName,
                link,
              },
            ];
          }
        }
        const { limit, label } = cur;
        return [
          ...acr,
          {
            type: 'store-wide-campaigns',
            limit,
            label,
            campaignName,
            link,
          },
        ];
      }, [])
    : [];
};

/**
 * free shipping bar data
 * @param shippingLimit
 * @param total
 */
export const freeShippingData = (shippingLimit: number, total: number): ResultItem[] => {
  if (!Number.isFinite(shippingLimit) || shippingLimit <= 0) {
    return [];
  }

  return [
    {
      type: 'free-shipping',
      limit: shippingLimit,
      label: 'Free Shipping',
      campaignName: 'Free Shipping',
      usingTotal: total,
    },
  ];
};

/**
 * gift promotions
 * @param giftPromotions
 * @param total
 * @returns
 */
interface GiftPromotion {
  is_eligible: boolean;
  min_spend: number;
}
export const giftPromotionsData = (
  giftPromotions: GiftPromotion[],
  hasGiftInOrder: boolean, // order.line_items.find((lineItem) => lineItem.is_gift);
  total: number
): ResultItem[] => {
  if (!Array.isArray(giftPromotions)) {
    return [];
  }
  const validGiftPromotion = giftPromotions?.length ? giftPromotions.find((promotion) => promotion.is_eligible) : null;
  const FREE_GIFT_LIMIT = Number(giftPromotions[0]?.min_spend);
  if (validGiftPromotion && !hasGiftInOrder) {
    return [
      {
        type: 'gift-promotion',
        limit: Number(validGiftPromotion.min_spend),
        label: 'Free Gift',
        campaignName: 'Free Gift',
        giftAvailable: true,
      },
    ];
  }
  if (!validGiftPromotion && total < FREE_GIFT_LIMIT) {
    // 不符合条件&未达到金额
    return [
      {
        type: 'gift-promotion',
        limit: FREE_GIFT_LIMIT,
        label: 'Free Gift',
        campaignName: 'Free Gift',
        giftAvailable: false,
      },
    ];
  }
  return [];
};

/**
 *
 * @param bars
 * @returns
 */
export const formatBars = (bars: ResultItem[]) => {
  if (bars.length === 0) return [];
  if (bars.length === 1) {
    bars[0].label = '';
  }
  return bars
    .slice()
    .sort((a, b) => a.limit - b.limit)
    .reduce((acc: ResultItem[], cur: ResultItem) => {
      const prev = acc.length ? acc[acc.length - 1] : null;
      if (prev && prev.limit === cur.limit) {
        prev.label = [prev.label, ` & ${cur.label}`];
        prev.giftAvailable = true;
        return [...acc.slice(0, -1), prev];
      }
      return [...acc, { ...cur, start: prev ? prev.limit : 0, end: cur.limit }];
    }, []);
};

export const findActiveStep = (bars: ResultItem[], total: number) => {
  if (!bars.length) {
    return 0;
  }
  if (total >= bars[bars.length - 1].limit) {
    return bars.length - 1;
  }

  return bars.findIndex((item: ResultItem) => total <= item.limit) || 0;
};

export const COMPLETE_COPY_MAP = {
  'gift-promotion': 'Congratulations! Free Gift unlocked.',
  'free-shipping': 'Congratulations! Free Shipping unlocked.',
  'store-wide-campaigns': 'Congratulations! Maximum savings unlocked.',
};
