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

export interface YotpoDetailRoot_V2 {
  total_spend_cents: number;
  total_purchases: number;
  last_purchase_at: any;
  first_name: string;
  last_name: string;
  phone_number: any;
  perks_redeemed: number;
  email: string;
  points_balance: number;
  points_earned: number;
  last_seen_at: string;
  thirty_party_id: string;
  third_party_id: string;
  pos_account_id: any;
  has_store_account: boolean;
  credit_balance: string;
  credit_balance_in_customer_currency: string;
  opt_in: boolean;
  opted_in_at: string;
  points_expire_at: string;
  next_points_expire_on: string;
  next_points_expire_amount: number;
  birthday_month: number;
  birth_day: number;
  birthday_year: number;
  vip_tier_actions_completed: VipTierActionsCompleted_V2;
  vip_tier_upgrade_requirements: VipTierUpgradeRequirements_V2;
}

export interface VipTierActionsCompleted_V2 {
  points_earned: number;
  amount_spent_cents: number;
  amount_spent_cents_in_customer_currency: number;
  purchases_made: number;
  referrals_completed: number;
  campaigns_completed: any[];
}

export interface VipTierUpgradeRequirements_V2 {
  points_needed: number;
  amount_cents_needed: number;
  amount_cents_needed_in_customer_currency: number;
  purchases_needed: number;
  referrals_needed: number;
  campaigns_needed: any[];
}

export interface YotpoRedemptionOption_V2 {
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
  discount_value_cents: any;
  name: string;
  description: string;
  unrendered_name: string;
  unrendered_description: string;
  cart_greater_than: string;
  discount_with_currency: string;
  variant_id?: string;
  quantity?: number;
}
