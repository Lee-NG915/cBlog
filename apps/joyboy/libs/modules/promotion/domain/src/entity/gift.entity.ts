// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FreeGiftResponse = FreeGiftPromotionType[];
import type { Gift } from '@castlery/types';
export interface FreeGiftPromotionType {
  promotion_id: string;
  is_eligible: boolean;
  min_spend: {
    amount?: {
      amount: number;
      currency_code: string;
    };
    purchaseType: number;
    quantity?: number;
  };
  gifts: Gift[];
  control_type: number;
}
