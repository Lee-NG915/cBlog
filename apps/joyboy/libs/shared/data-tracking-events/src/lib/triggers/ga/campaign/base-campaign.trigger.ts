import { GaMetricsCustom } from '../../../metrics';

export type CampaignEventCategory =
  | 'choose_free_gift'
  | 'gwp_add_to_cart'
  | 'campaign_progress_bar_impression'
  | 'campaign_progress_bar_link_click';

export interface BaseCampaignArgs {
  category: CampaignEventCategory;
  label?: 'miniCart' | 'fullCart';
  campaignName?: string;
  position?: string;
  discount?: string;
  giftId?: string;
}

export interface BaseCampaignDataLayer {
  event: GaMetricsCustom.track_event;
  eventDetails: {
    category: CampaignEventCategory;
    action?: string;
    label: string;
    method?: string;
    position?: string;
    gift_id?: string;
  };
}

export const baseCampaignTrigger = (args: BaseCampaignArgs): BaseCampaignDataLayer => {
  const { category, label, campaignName, position, discount, giftId } = args;

  return {
    event: GaMetricsCustom.track_event,
    eventDetails: {
      category,
      action: campaignName,
      label,
      method: discount,
      position,
      gift_id: giftId,
    },
  };
};
