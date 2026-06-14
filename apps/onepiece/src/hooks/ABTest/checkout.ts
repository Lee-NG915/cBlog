import { useMemo, useCallback, useEffect } from 'react';
import { useApiCampaigns } from 'hooks/dy';
import { useDispatch } from 'react-redux';
import { EVENT_DY_AB_TEST } from 'utils/track/constants';
import { reportClickEngagement } from 'utils/dyReporting';
import type { ABTestCampaign } from './types';
/**
 * @CampaignName Delivery Period Button
 * @ticket https://app.clickup.com/t/86epgvdqv
 * @returns {variation: string, text: string}
 */
export function useDeliveryPeriodButtonTest() {
  const campaignName = 'Delivery Period Button';
  const dyApiCampaigns = useApiCampaigns({ selectorArray: [campaignName], pageType: 'checkout' }) as ABTestCampaign;
  const variation = dyApiCampaigns[campaignName]?.data?.variation;
  const text = dyApiCampaigns[campaignName]?.data?.text;

  const decisionId = dyApiCampaigns[campaignName]?.decisionId;
  const variationId = dyApiCampaigns[campaignName]?.variationId;

  const dispatch = useDispatch();

  useEffect(() => {
    if (variation) {
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

  const reportClick = useCallback(() => {
    reportClickEngagement({ decisionId, variationId });
  }, [decisionId, variationId]);

  return { variation, text, reportClick };
}
