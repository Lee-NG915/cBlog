import type { LineItemSchema } from '@castlery/types';

export type FacebookCapiValue = string | number;
export type FacebookCapiCurrency = string | undefined;

export type FacebookCapiProductTriggerPayloadSchema = {
  eventId: string;
  originalPrice: string;
  variant: {
    name: string;
    sku: string;
  };
};

export type FacebookViewContentTriggerPayloadSchema = FacebookCapiProductTriggerPayloadSchema;

export type FacebookAddToCartTriggerPayloadSchema = FacebookCapiProductTriggerPayloadSchema;

export type FacebookAddSwatchToCartTriggerPayloadSchema = {
  eventId: string;
  variant: {
    name: string;
    sku: string;
  };
  swatchRelatedProductId: number | undefined;
};

export type FacebookAddToWishlistTriggerPayloadSchema = {
  eventId: string;
  variant: {
    name: string;
    sku: string;
    price: string;
  };
};

export type FacebookEventIdTriggerPayloadSchema = {
  eventId: string;
};

export type FacebookInitiateCheckoutTriggerPayloadSchema = {
  eventId?: string;
  itemTotal: string;
  numItems: number;
  lineItems: LineItemSchema[];
};

export type FacebookAddPaymentInfoTriggerPayloadSchema = {
  eventId: string;
  value: string;
  contentIds: string[];
};

export type FacebookPurchaseTriggerPayloadSchema = {
  eventId: string;
  value: string;
  orderId: string;
  contentIds: string[];
  contentType: 'product';
  contents: { id: string; quantity: number; item_price: string }[];
};

export type FacebookSwatchPurchaseTriggerPayloadSchema = {
  eventId: string;
  swatchSkus: string[];
};

export type FacebookNewCustomerPurchaseTriggerPayloadSchema = {
  eventId: string;
  value: string;
  orderId: string;
  contents: { id: string; quantity: number; item_price: string }[];
  contentIds: string[];
};

export type FacebookProductCustomDataSchema = {
  value: FacebookCapiValue;
  currency: FacebookCapiCurrency;
  content_name: string;
  content_ids: string[];
  content_type: 'product';
};

export type FacebookSwatchAddToCartCustomDataSchema = {
  content_category: 'Swatch';
  content_ids: string[];
  content_name: string;
  related_product_id: number;
};

export type FacebookWishlistCustomDataSchema = {
  value: number;
  currency: FacebookCapiCurrency;
  content_name: string;
  content_ids: string[];
};

export type FacebookRegistrationCustomDataSchema = {
  value: number;
  currency: FacebookCapiCurrency;
  content_name: string;
};

export type FacebookInitiateCheckoutCustomDataSchema = {
  value: number;
  currency: FacebookCapiCurrency;
  num_items: number;
  content_ids: string[];
};

export type FacebookAddPaymentInfoCustomDataSchema = {
  value: string;
  currency: FacebookCapiCurrency;
  content_ids: string[];
};

export type FacebookPurchaseCustomDataSchema = {
  content_ids: string[];
  content_type: 'product';
  contents: { id: string; quantity: number; item_price: string }[];
  value: string;
  currency: FacebookCapiCurrency;
  order_id: string;
};

export type FacebookSwatchPurchaseCustomDataSchema = {
  content_ids: string[];
  content_category: 'Swatch';
  content_type: 'swatch';
};

export type FacebookNewCustomerPurchaseCustomDataSchema = {
  value: string;
  currency: FacebookCapiCurrency;
  order_id: string;
  content_type: 'product';
  contents: { id: string; quantity: number; item_price: string }[];
  content_ids: string[];
};

export type FacebookEmptyCustomDataSchema = Record<string, never>;

export type FacebookCapiCustomDataSchema =
  | FacebookProductCustomDataSchema
  | FacebookSwatchAddToCartCustomDataSchema
  | FacebookWishlistCustomDataSchema
  | FacebookRegistrationCustomDataSchema
  | FacebookInitiateCheckoutCustomDataSchema
  | FacebookAddPaymentInfoCustomDataSchema
  | FacebookPurchaseCustomDataSchema
  | FacebookSwatchPurchaseCustomDataSchema
  | FacebookNewCustomerPurchaseCustomDataSchema
  | FacebookEmptyCustomDataSchema;
