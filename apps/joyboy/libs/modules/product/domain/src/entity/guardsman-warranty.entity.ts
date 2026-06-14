export interface GuardsmanPlan {
  id: string;
  text: string;
  price: number;
  term: number;
  providerSku: string;
  offerId: string;
}

export interface GuardsmanWarrantyDiscoveryResponse {
  success: boolean;
  plans: GuardsmanPlan[];
  planType?: string;
  error?: string;
}

