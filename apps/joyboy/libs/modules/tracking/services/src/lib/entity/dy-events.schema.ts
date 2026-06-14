import type { LineItemSchema } from '@castlery/types';

export type DYValue = string | number;

export type DYLegacyLineItemSchema = {
  is_swatch: boolean;
  quantity: number;
  variant: {
    sku: string;
    price: string;
  };
};

export type DYPurchaseOrderSchema = {
  line_items: DYLegacyLineItemSchema[];
  item_count: number;
  /** Order number；映射为 `uniqueTransactionId`（DY 官方要求 string，≤64 chars），调用方需保证为 `string` 类型 */
  number: string;
  /** 订单总金额（含税运等），= `value` 字段（DY 官方要求 Float），调用方需保证为 `number` 类型 */
  total: number;
  currency: string;
};

/**
 * @deprecated 旧的宽松 cart item 类型（`itemPrice: DYValue`）。
 * 各 DY 事件已迁移到事件粒度的 cart item schema（`DYAddToCartItemSchema` / `DYPurchaseCartItemSchema` / `DYRemoveFromCartCartItemSchema`，均 `itemPrice: number`）。
 * 该类型保留仅为兼容历史外部消费；新代码请勿使用。
 */
export type DYCartItemSchema = {
  productId: string;
  quantity: number;
  itemPrice: DYValue;
};

/**
 * DY Add to Cart `cart[]` 元素类型（对齐官方 add-to-cart-v1）。
 * @see https://dy.dev/docs/add-to-cart
 */
export type DYAddToCartItemSchema = {
  productId: string;
  quantity: number;
  itemPrice: number;
};

/**
 * DY Purchase `cart[]` 元素类型（对齐官方 purchase-v1）。
 * 与 ATC item 结构一致（`itemPrice: number`），按事件粒度拆分独立 schema 以便后续各自演进（官方允许可选 `size` 字段）。
 * @see https://dy.dev/docs/purchase
 */
export type DYPurchaseCartItemSchema = {
  productId: string;
  quantity: number;
  itemPrice: number;
};

/**
 * DY Remove from Cart `cart[]` 元素类型（对齐官方 remove-from-cart-v1）。
 * 结构与 ATC 完全一致；按事件粒度独立定义以便后续演进。
 * @see https://dy.dev/docs/remove-from-cart
 */
export type DYRemoveFromCartCartItemSchema = {
  productId: string;
  quantity: number;
  itemPrice: number;
};

export type DYApiRecommendationsEngagementTriggerPayloadSchema = {
  slotId: string;
};

export type DYApiCustomCodeCampaignEngagementTriggerPayloadSchema = {
  engagementType: 'IMP' | 'CLICK';
  decisionId: string;
  variations?: number[];
};

export type DYSwatchAddToCartTriggerPayloadSchema = {
  variant: {
    name: string;
    sku: string;
  };
  swatchRelatedProductSlug?: string;
};

export type DYAddToCartTriggerPayloadSchema = {
  cartLineItems: DYLegacyLineItemSchema[];
  variant: {
    sku: string;
    name: string;
    quantity: number;
  };
  /** 目标商品单价（Float, dollars.cents），由外部计算好传入；用于计算 `value = targetPrice × quantity` */
  targetPrice: number;
};

export type DYAddToCartTriggerPayloadSchemaV2 = {
  cartLineItems: LineItemSchema[];
  targetLineItem: LineItemSchema;
  /** 目标商品单价（Float, dollars.cents），由外部计算好传入；用于计算 `value = targetPrice × quantity` */
  targetPrice: number;
};

export type DYAddToWishlistTriggerPayloadSchema = {
  variant: {
    sku: string;
  };
};

export type DYKeywordSearchTriggerPayloadSchema = {
  keywords: string;
};

export type DYFilterItemsTriggerPayloadSchema = {
  type: string;
  value: string;
};

export type DYSwatchPurchaseTriggerPayloadSchema = {
  swatches: {
    variant: {
      sku: string;
    };
  }[];
};

export type DYPurchaseTriggerPayloadSchema = {
  order: DYPurchaseOrderSchema | null | undefined;
};

export type DYRemoveFromCartTriggerPayloadSchema = {
  variant: {
    sku: string;
  };
  quantity: number;
  cartLineItems: {
    variant: {
      sku: string;
    };
    quantity: number;
    price: string;
  }[];
  /** 被移除商品的单价（Float, dollars.cents），由外部计算好传入；用于计算 `value = targetPrice × quantity` */
  targetPrice: number;
};

export type DYNewsletterSubscriptionTriggerPayloadSchema = {
  email: string;
};

export type DYUserIdentificationTriggerPayloadSchema = {
  email: string;
  id: string;
};

export type DYPromoCodeEnteredTriggerPayloadSchema = {
  promoCode: string;
};

export type DYSwatchAddToCartEventPropertiesSchema = {
  'Swatch Name': string;
  'Swatch SKU': string;
  'Related Product': string;
};

/**
 * DY Add to Cart 事件 payload（对齐官方 add-to-cart-v1）。
 * - `value` = 本次加车商品总价（仅新加入，= 单价 × 数量），必填 Float
 * - `currency` 多市场必填（来自 `INTL_CURRENCY`）
 * - `itemPrice` 为 number（见 {@link DYAddToCartItemSchema}）
 * @see https://dy.dev/docs/add-to-cart
 */
export type DYAddToCartEventPropertiesSchema = {
  dyType: 'add-to-cart-v1';
  value: number;
  currency: string;
  productId: string;
  quantity: number;
  cart: DYAddToCartItemSchema[];
};

export type DYAddToWishlistEventPropertiesSchema = {
  dyType: 'add-to-wishlist-v1';
  productId: string;
};

export type DYKeywordSearchEventPropertiesSchema = {
  dyType: 'keyword-search-v1';
  keywords: string;
};

export type DYFilterItemsEventPropertiesSchema = {
  dyType: 'filter-items-v1';
  filterType: string;
  filterStringValue: string;
};

export type DYSwatchPurchaseEventPropertiesSchema = {
  'Swatch SKUs': string;
};

/**
 * DY Purchase 事件 payload（对齐官方 purchase-v1）。
 * - `value`：订单全单总金额，Float（必填，与 ATC value=本次新增金额 的口径不同）
 * - `uniqueTransactionId`：≤64 字符的 string；建议用订单号，保证幂等
 * - `currency`：多市场必填
 * @see https://dy.dev/docs/purchase
 */
export type DYPurchaseEventPropertiesSchema = {
  dyType: 'purchase-v1';
  value: number;
  currency: string;
  uniqueTransactionId: string;
  cart: DYPurchaseCartItemSchema[];
};

/**
 * DY Remove from Cart 事件 payload（对齐官方 remove-from-cart-v1）。
 * - `value`：被移除商品金额（= 单价 × 移除数量），Float（官方必填）
 * - `currency`：多市场必填（之前缺失，本次新增）
 * - Schema 与 ATC 一致，仅 `dyType` 不同
 * @see https://dy.dev/docs/remove-from-cart
 */
export type DYRemoveFromCartEventPropertiesSchema = {
  dyType: 'remove-from-cart-v1';
  value: number;
  currency: string;
  productId: string;
  quantity: number;
  cart: DYRemoveFromCartCartItemSchema[];
};

export type DYNewsletterSubscriptionEventPropertiesSchema = {
  dyType: 'newsletter-subscription-v1';
  hashedEmail: string;
};

export type DYUserIdentificationEventPropertiesSchema =
  | {
      dyType: 'signup-v1' | 'login-v1';
      hashedEmail: string;
    }
  | {
      dyType: 'signup-v1' | 'login-v1';
      cuid: string;
    };

/**
 * DY Promo Code Entered 事件 payload（对齐官方 enter-promo-code-v1）。
 * - `dyType`：注意官方为 `enter-promo-code-v1`（不是 `promo-code-entered-v1`，旧实现的字符串有误）
 * - `code`：用户输入并成功 apply 的优惠码
 * @see https://dy.dev/docs/promo
 */
export type DYPromoCodeEnteredEventPropertiesSchema = {
  dyType: 'enter-promo-code-v1';
  code: string;
};
