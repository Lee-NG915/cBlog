import { useEffect, useCallback } from 'react';
import { useApiCampaigns } from 'hooks/dy';
import { useDispatch } from 'react-redux';

import { EVENT_DY_AB_TEST } from 'utils/track/constants';
import { reportClickEngagement } from 'utils/dyReporting';
import type { ABTestVariation } from './types';

interface ABTestProps {
  campaignName: string;
}

interface ABTestResult {
  variantionData: ABTestVariation;
  reportClick: () => void;
}

/**
 * @description ABTest hook
 * @param {string} campaignName
 * @returns {variation?: string}
 */
export function useABTest({ campaignName }: ABTestProps): ABTestResult {
  const dyApiCampaigns = useApiCampaigns({ selectorArray: [campaignName] }) || {};

  const variantionData = dyApiCampaigns[campaignName]?.data || {};
  const dispatch = useDispatch();
  const variation = variantionData?.variation;

  const decisionId = dyApiCampaigns[campaignName]?.decisionId;
  const variationId = dyApiCampaigns[campaignName]?.variationId;

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

  return { variantionData, reportClick };
}
