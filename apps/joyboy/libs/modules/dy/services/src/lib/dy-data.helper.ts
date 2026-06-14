/**
 * @description Formats the response from dy response `res.choices`
 * @returns `{[campaignName:string]:{rawData:Record<string,any>,hitVariation:Record<string,any>}}`
 */
export function formatCampaignsResponse(campaigns: { [key: string]: any }[]) {
  if (!campaigns || !Array.isArray(campaigns)) return {};
  const formattedCampaigns = campaigns.reduce((acc, campaign) => {
    const hitItem = Array.isArray(campaign['variations']) ? campaign['variations'][0] : null;
    let variation = {};
    if (hitItem) {
      variation = hitItem.payload.data;
    }
    acc[campaign['name']] = { rawData: campaign, hitVariation: variation };
    return acc;
  }, {});
  return formattedCampaigns;
}

// todo : 优化 - @abby
