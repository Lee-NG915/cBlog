/**
 *
 * @param campaigns campaigns data => res.data.choices
 * @returns
 */
export const formatCampaignsResponse = (campaigns: Record<string, any>[]) => {
  if (!campaigns || !Array.isArray(campaigns)) return {};
  return campaigns.reduce((acc, campaign) => {
    const hitItem = Array.isArray(campaign['variations']) ? campaign['variations'][0] : null;
    let variation = {};
    if (hitItem) {
      variation = hitItem.payload.data;
    }
    acc[campaign['name']] = { rawData: campaign, hitVariation: variation };
    return acc;
  }, {});
};
