import { Links } from './line-item.entity';
import { GiftVariantSchema } from './cart.entity';
export interface FreeGiftPromotionType {
  id: number;
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
  promotion_id: string;
  control_type: number;
}
export interface Gift {
  id: number;
  quantity: number;
  state: GiftState;
  variant: GiftVariant;
  controlType: number;
  promotionId: string;
  gift_pool_id: string;
}

export interface GiftVariant {
  id: number;
  sku: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  variant_option_values: GiftVariantOptionValue[];
  price: string;
  list_price: string;
  images: GiftImageItem[];
}

export interface GiftVariantOptionValue {
  name: string;
  presentation: string;
  option_value_id: number;
  option_type_id: number;
  option_type_name: string;
  option_type_presentation: string;
}

export interface GiftImageItem {
  position: number;
  type: string;
  links: Links;
}

export enum GiftState {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface GiftVariantDetailSchema {
  stockStatus: string;
  variant: GiftVariantSchema;
}
