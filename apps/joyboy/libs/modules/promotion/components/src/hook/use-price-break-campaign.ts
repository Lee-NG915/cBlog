'use client';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCartSummary } from '@castlery/modules-cart-domain';
import { makeCookiesHandle } from '@castlery/shared-persistence-kit';
import { useGetDyCampaignsQuery, DY_CAMPAIGNS_NAME } from '@castlery/modules-dy-domain';
// eslint-disable-next-line
import { isOutdated } from '@castlery/modules-cms-services';
import type { Order } from '@castlery/types';
import { dyRecommendationsApi } from '@castlery/modules-dy-domain';
import type { CampaignsRequestOptions } from '@castlery/modules-dy-domain';

export interface PriceBreakDiscount {
  limit: number;
  label: string;
  icon: string;
}

export interface CampaignMessage {
  startDate: string;
  endDate: string;
  link: string;
  campaignName: string;
  discounts: PriceBreakDiscount[];
  discountStrategy?: {
    off: number;
    increment: number;
    minLimit: number;
    maxLimit: number;
  };
}

export type CampaignMessages = CampaignMessage[];

export const usePriceBreakCampaign = () => {
  const cartSummary = useAppSelector(selectCartSummary);
  const insiderIndex = makeCookiesHandle('castlery_insider', false)().getItem();
  const itemTotal = cartSummary?.itemTotal?.actualSubtotal ? +cartSummary.itemTotal.actualSubtotal : 0;

  // DY Campaign Messages
  const priceBreakCampaignName = DY_CAMPAIGNS_NAME.PRICE_BREAK;
  const { data } = useGetDyCampaignsQuery({
    selectors: [priceBreakCampaignName],
    tagTypes: 'Gift',
    campaignNames: [priceBreakCampaignName],
  } as CampaignsRequestOptions);

  const priceBreakCampaigns: {
    campaignName: string;
    startDate: string;
    endDate: string;
    link: string;
    discounts: {
      limit: number;
      label: string;
      icon: string;
    }[];
  }[] = data ? data.choices[0]?.variations[0]?.payload?.data ?? [] : [];
  // 确定当前适用的价格阶梯活动
  const priceBreakCampaign = useMemo(() => {
    if (insiderIndex && ['0', '1', '2', '3'].includes(insiderIndex)) {
      return priceBreakCampaigns[parseInt(insiderIndex)];
    }
    return priceBreakCampaigns.find((campaign) => !isOutdated(campaign.startDate, campaign.endDate));
  }, [insiderIndex, priceBreakCampaigns]);

  const calcDiscount = useCallback(
    ({ off, increment, minLimit, maxLimit }: any) => {
      if (
        typeof off !== 'number' ||
        off <= 0 ||
        typeof increment !== 'number' ||
        increment <= 0 ||
        minLimit > maxLimit
      ) {
        return null;
      }

      if (itemTotal < maxLimit) {
        const m = Math.floor(itemTotal / increment) + 1;
        return {
          icon: 'check-circle',
          limit: m * increment,
          label: `$${off * m} off`,
        };
      }
      return null;
    },
    [itemTotal]
  );
  let currentPriceBreakCampaign = null;

  if (priceBreakCampaign) {
    if ('discountStrategy' in priceBreakCampaign && priceBreakCampaign?.discountStrategy) {
      currentPriceBreakCampaign = calcDiscount(priceBreakCampaign.discountStrategy);
    } else {
      currentPriceBreakCampaign = priceBreakCampaign?.discounts?.find((discount) => itemTotal < discount.limit);
    }
  }

  return {
    currentPriceBreakCampaign,
    priceBreakCampaign,
  };
};
