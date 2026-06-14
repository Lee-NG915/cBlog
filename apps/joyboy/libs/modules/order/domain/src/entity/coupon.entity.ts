export interface CouponItemV1 {
  id: number;
  expired_at: string;
  code: string;
  name: string;
  calculators: CouponCalculator[];
  min_spend: string;
  available: boolean;
  unavailable_reason: string;
}

export interface CouponCalculator {
  type: string;
  preferences: Preferences;
}

export interface Preferences {
  base_percent: string;
  tiers: Tiers;
  effective_tier: string;
}

export interface Tiers {
  [keyName: string]: string;
}
