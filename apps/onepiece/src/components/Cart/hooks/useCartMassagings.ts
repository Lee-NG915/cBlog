import { useMemo } from 'react';
import { useApiCampaigns } from 'hooks/dy';

export interface CartMassagingItemType {
  startDate: string;
  endDate: string;
  link: string;
  campaignName: string;
  discounts: Array<{ limit: number; label: string; icon: string }>;
}

export type CartMassagingsType = CartMassagingItemType[];

function useCartMassagings(): CartMassagingsType {
  const priceBreakCampaignName = 'Cart Messagings Configure';
  const dyApiCampaigns = useApiCampaigns({ selectorArray: [priceBreakCampaignName], pageType: 'cart' });
  const priceBreakCampaigns = useMemo(() => {
    if (!dyApiCampaigns || !dyApiCampaigns[priceBreakCampaignName]?.data) {
      return [];
    }
    const data = dyApiCampaigns[priceBreakCampaignName].data as CartMassagingsType;
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  }, [dyApiCampaigns]);
  return priceBreakCampaigns;
}

export default useCartMassagings;
