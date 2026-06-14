export interface ABTestVariation {
  variation?: string;
  variant?: string;
  [key: string]: any;
}
export interface Campaigns {
  campaignName?: string;
  data?: ABTestVariation;
  decisionId: string;
  variationId: string | number;
}

export interface ABTestCampaign {
  [key: string]: Campaigns;
}
