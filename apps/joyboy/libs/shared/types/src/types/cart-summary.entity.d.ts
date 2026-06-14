export interface Promotion_V2 {
  actionId: number;
  actionType: string;
  discount: string;
  promotionDesc: string;
  promotionID: number;
  promotionName: string;
  totalDiscount: string;
}

export interface ItemTotal_V2 {
  actualSubtotal: string;
  originalSubtotal: string;
}

export interface ShippingFee_V2 {
  actualTotal: string;
  shipmentOriginalTotal: string;
  shipments: {
    actualShippingFee: string;
    freeShippingThreshold: string;
    originalShippingFee: string;
    shipmentId: string;
  }[];
}

export interface WarrantyTotal_V2 {
  actualTotal: string;
  originalTotal: string;
}

export interface ServiceAmount_V2 {
  actualTotal: string;
  originalTotal: string;
  typeAmountMap: TypeAmountMap_V2;
}

export interface TypeAmountMap_V2 {
  [serviceType: string]: string;
}

export interface Coupon_V2 {
  code: string;
  amount: string;
  isValid: boolean;
  invalidReason: string;
  couponDesc: string;
}

export interface Extra_V2 {
  wareHouseCode: string;
}

export type CartSummarySchema_V2 = {
  currency: string;
  total: string;
  itemTotal: {
    actualSubtotal: string;
    originalSubtotal: string;
  };
  shippingFee: {
    actualTotal: string;
    shipmentOriginalTotal: string;
    shipments: Array<any>;
  };
  taxTotal: string;
  warrantyTotal: {
    actualTotal: string;
    originalTotal: string;
  };
  serviceAmount: {
    actualTotal: string;
    originalTotal: string;
    typeAmountMap: {};
  };
  promoTotal: string;
  promotions: Array<any>;
  coupon: {
    code: string;
    amount: string;
    isValid: boolean;
    invalidReason: string;
    couponDesc: string;
  };
  couponList: Array<any>;
  extra: {
    wareHouseCode: string;
  };
  giftPools: any[];
};
