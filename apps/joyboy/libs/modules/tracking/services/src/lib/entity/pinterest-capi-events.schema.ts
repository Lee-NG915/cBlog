export type PinterestCapiValue = string | number;

export type PinterestProductTriggerPayloadSchema = {
  eventId: string;
  originalPrice: string;
  variant: {
    name: string;
    sku: string;
  };
};

export type PinterestPageVisitTriggerPayloadSchema = PinterestProductTriggerPayloadSchema;

export type PinterestAddToCartTriggerPayloadSchema = PinterestProductTriggerPayloadSchema;

export type PinterestAddToWishlistTriggerPayloadSchema = {
  eventId: string;
  variant: {
    name: string;
    sku: string;
    price: string;
  };
};

export type PinterestAddSwatchToCartTriggerPayloadSchema = {
  eventId: string;
  variant: {
    sku: string;
  };
};

export type PinterestEventIdTriggerPayloadSchema = {
  eventId: string;
};

export type PinterestPurchaseTriggerPayloadSchema = {
  eventId: string;
  value: string;
  orderId: string;
  contentIds: string[];
  contents: { quantity: number; item_price: string }[]; // 不包含id
};

export type PinterestSwatchPurchaseTriggerPayloadSchema = {
  eventId: string;
  swatchSkus: string[];
};

export type PinterestNewCustomerPurchaseTriggerPayloadSchema = {
  eventId: string;
  value: string;
  orderId: string;
  contentIds: string[];
  contents: { id: string; quantity: number; item_price: string }[];
};

export type PinterestProductCustomDataSchema = {
  value: PinterestCapiValue;
  currency: string;
  content_name: string;
  content_ids: string[];
};

export type PinterestRegistrationCustomDataSchema = {
  value: number;
  currency: string;
  content_name: string;
};

export type PinterestPurchaseCustomDataSchema = {
  value: string;
  currency: string;
  content_ids: string[];
  order_id: string;
  contents: { quantity: number; item_price: string }[];
};

export type PinterestSwatchCustomDataSchema = {
  content_ids: string[];
};

export type PinterestInitiateCheckoutTriggerPayloadSchema = {
  eventId: string;
  value: string;
  numItems: number;
  variants: {
    sku: string;
  }[];
};

export type PinterestInitiateCheckoutCustomDataSchema = {
  value: PinterestCapiValue;
  currency: string;
  num_items: number;
  content_ids: string[];
};

export type PinterestAddPaymentInfoTriggerPayloadSchema = {
  eventId: string;
  value: string;
  contentIds: string[];
};

export type PinterestAddPaymentInfoCustomDataSchema = {
  value: string;
  currency: string;
  content_ids: string[];
};

export type PinterestNewCustomerPurchaseCustomDataSchema = {
  value: string;
  currency: string;
  content_ids: string[];
  order_id: string;
  contents: { id: string; quantity: number; item_price: string }[];
};
