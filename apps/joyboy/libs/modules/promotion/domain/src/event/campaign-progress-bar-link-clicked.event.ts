import { createAction } from '@reduxjs/toolkit';

export interface CampaignProgressBarLinkClickedPayload {
  /** Campaign name displayed in the progress-bar link text. */
  campaignName: string;
  /** Current discount label displayed in the progress bar, e.g. `$20 off`. */
  discount: string;
}

/**
 * @description User clicked the price-break campaign progress-bar link text.
 * Fires on every click, before the link opens. The tracking listener forwards
 * this to `EVENT_GA_CAMPAIGN_PROGRESS_BAR_LINK_CLICK`.
 */
export const campaignProgressBarLinkClickedEvent = createAction<CampaignProgressBarLinkClickedPayload>(
  'promotion/campaignProgressBarLinkClicked'
);
