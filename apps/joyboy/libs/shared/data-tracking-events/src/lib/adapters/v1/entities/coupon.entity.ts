export interface CouponType {
  id: number;
  expired_at: string;
  code: string;
  name: string;
  discount_value: string;
  calculators: CouponCalculator[];
  min_spend: string;
  available: boolean;
  unavailable_reason?: string;
}

export interface CouponCalculator {
  type: string;
  preferences: CouponPreferences;
}

export interface CouponPreferences {
  amount: string;
  currency: string;
  tag_ids?: string;
}
