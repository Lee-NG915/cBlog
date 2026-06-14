import { baseCampaignTrigger } from './base-campaign.trigger';

export type CampaignTriggerPayload = {
  label?: 'miniCart' | 'fullCart';
  position?: string;
  campaignName?: string;
  discount?: string;
  giftId?: string;
};

// GWP Banner Click
export const gwpBannerClick = (payload: CampaignTriggerPayload) => {
  return baseCampaignTrigger({
    category: 'choose_free_gift',
    ...payload,
  });
};

// GWP Add to Cart
export const gwpAddToCart = (payload: CampaignTriggerPayload) => {
  return baseCampaignTrigger({
    category: 'gwp_add_to_cart',
    campaignName: 'cart_event',
    giftId: payload.giftId, // dynamic, sku name of pr
    ...payload,
  });
};

// Campaign Progress Bar Impression
export const campaignProgressBarImpression = (payload: CampaignTriggerPayload) => {
  return baseCampaignTrigger({
    category: 'campaign_progress_bar_impression',
    ...payload,
  });
};

// Campaign Progress Bar Link Click
export const campaignProgressBarClick = (payload: CampaignTriggerPayload) => {
  return baseCampaignTrigger({
    category: 'campaign_progress_bar_link_click',
    ...payload,
  });
};
