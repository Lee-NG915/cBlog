import type { LineItem, LineItemSchema } from '@castlery/types';

export type KlaviyoMoney = string;

export type KlaviyoProductItemEventSchema = {
  ProductName: string;
  Quantity: number;
  ImageURL: string;
  ProductURL: string;
  UnitPrice: {
    OriginalPrice: KlaviyoMoney | null;
    SalesPrice: KlaviyoMoney;
  };
  RowTotal: KlaviyoMoney;
  SKU: string;
  Categories: string[];
  CollectionName: string;
  OptionsText: string[];
};

export type KlaviyoIdentifyEventSchema = {
  $email: string;
  $first_name: string;
  $last_name: string;
};

export type KlaviyoViewedProductEventSchema = {
  ProductName: string;
  ProductID: string | number;
  SKU: string;
  Categories: string[];
  ImageURL: string;
  URL: string;
  Brand: string;
  Price: number;
  CompareAtPrice: number;
};

export type KlaviyoRecentlyViewedItemsEventSchema = {
  Title: string;
  ItemId: string | number;
  Categories: string[];
  ImageUrl: string;
  Url: string;
  Metadata: {
    Brand: string;
    Price: number;
    CompareAtPrice: number;
  };
};

export type KlaviyoAddedToCartEventSchema = {
  $value: number;
  Items: KlaviyoProductItemEventSchema[];
};

export type KlaviyoStartedCheckoutEventSchema = {
  $value: number;
  Items: KlaviyoProductItemEventSchema[];
};

export type KlaviyoIdentifyTriggerPayloadSchema = {
  email: string;
  firstname: string;
  lastname: string;
};

export type KlaviyoAddedToCartTriggerPayloadSchema = {
  targetVariantSku: LineItem['variant']['sku'];
  qtyIncrements: number;
  cartLineItems: LineItem[];
  itemTotal: string;
};

export type KlaviyoAddedToCartTriggerPayloadSchemaV2 = {
  cartLineItems: LineItemSchema[];
  targetLineItem: LineItemSchema;
  cartItemTotal: string;
  quantityDifference: number;
};

export type KlaviyoStartedCheckoutTriggerPayloadSchema = {
  lineItems: LineItemSchema[];
  itemTotal: string;
};
