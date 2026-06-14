export interface YotpoRedemPtionOption {
  id: number;
  icon: string;
  cost_text: string;
  amount: number;
  applies_to_product_type: string;
  duration: string;
  type: string;
  discount_amount_cents: number;
  discount_rate_cents: any;
  discount_percentage: any;
  discount_type: string;
  discount_value_cents?: number;
  name: string;
  description: string;
  unrendered_name: string;
  unrendered_description: string;
  cart_greater_than: string;
  discount_with_currency: string;
  variant_id?: string;
  quantity?: number;
}
