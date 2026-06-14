import { useMemo, useEffect } from 'react';
import { useApiCampaigns } from 'hooks/dy';
import modalState from 'containers/Frame/modalState';
import { useDispatch } from 'react-redux';

import { EVENT_DY_AB_TEST } from 'utils/track/constants';
import type { ABTestCampaign } from './types';

/**
 * @CampaignName Full Cart Behavior
 * @ticket https://app.clickup.com/t/865ck4b77
 * @returns {variation: string, checkoutBtnText: string, isMiniCart: boolean}
 */
export function useFullCartBehaviorTest() {
  const campaignName = 'Full Cart Behavior';
  const dyApiCampaigns = useApiCampaigns({ selectorArray: [campaignName], pageType: 'cart' }) as ABTestCampaign;
  const variation = dyApiCampaigns[campaignName]?.data?.variation;
  const variationB = variation === 'B';
  const isMiniCart = modalState?.states && modalState?.states.includes('cart');

  const dispatch = useDispatch();

  useEffect(() => {
    if (isMiniCart && variation) {
      dispatch({
        type: EVENT_DY_AB_TEST,
        result: {
          campaignName,
          variation,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variation, campaignName]);

  const checkoutBtnText = useMemo(() => {
    // mini-cart & variation B
    if (isMiniCart && variationB) {
      return 'Review Cart';
    }
    return 'Checkout';
  }, [isMiniCart, variationB]);

  return { variation, checkoutBtnText, isMiniCart, variationB };
}
