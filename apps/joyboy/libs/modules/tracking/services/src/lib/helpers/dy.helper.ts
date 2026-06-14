import { INTL_CURRENCY, ProductTypeMapping } from '@castlery/config';
import { logger } from '@castlery/observability';
import type {
  DYAddToCartEventPropertiesSchema,
  DYAddToCartTriggerPayloadSchema,
  DYAddToCartTriggerPayloadSchemaV2,
  DYAddToWishlistEventPropertiesSchema,
  DYAddToWishlistTriggerPayloadSchema,
  DYFilterItemsEventPropertiesSchema,
  DYFilterItemsTriggerPayloadSchema,
  DYKeywordSearchEventPropertiesSchema,
  DYKeywordSearchTriggerPayloadSchema,
  DYNewsletterSubscriptionEventPropertiesSchema,
  DYPurchaseEventPropertiesSchema,
  DYPurchaseOrderSchema,
  DYPromoCodeEnteredEventPropertiesSchema,
  DYPromoCodeEnteredTriggerPayloadSchema,
  DYRemoveFromCartEventPropertiesSchema,
  DYRemoveFromCartTriggerPayloadSchema,
  DYSwatchAddToCartEventPropertiesSchema,
  DYSwatchAddToCartTriggerPayloadSchema,
  DYSwatchPurchaseEventPropertiesSchema,
  DYSwatchPurchaseTriggerPayloadSchema,
  DYUserIdentificationEventPropertiesSchema,
} from '../entity';
import {
  buildDYAddToCartItem,
  buildDYAddToCartItemV2,
  buildDYPurchaseCartItem,
  buildDYRemoveFromCartCartItem,
} from '../utils/dy.util';

/** DY 官方约束：uniqueTransactionId 最大长度 64 字符。 @see https://dy.dev/docs/purchase */
const DY_UNIQUE_TX_ID_MAX_LENGTH = 64;

export type DYLogEvent =
  | 'api_recommendations_engagement'
  | 'custom_code_campaign_engagement'
  | 'swatch_atc'
  | 'add_to_cart'
  | 'add_to_cart_v2'
  | 'add_to_wishlist'
  | 'keyword_search'
  | 'filter_items'
  | 'swatch_purchase'
  | 'purchase'
  | 'remove_from_cart'
  | 'newsletter_subscription'
  | 'signup'
  | 'login'
  | 'promo_code_entered';

const DY_LOG_PREFIX = '[DY]';

export const logDYWarn = (event: DYLogEvent, reason: string, extra?: Record<string, unknown>): void => {
  logger.warn(`${DY_LOG_PREFIX} ${event}: ${reason}`, extra);
};

export const logDYError = (event: DYLogEvent, error: unknown, extra?: Record<string, unknown>): void => {
  logger.error(`${DY_LOG_PREFIX} ${event}:`, {
    error,
    ...extra,
  });
};

export const buildDYSwatchAddToCartProperties = (
  payload: DYSwatchAddToCartTriggerPayloadSchema
): DYSwatchAddToCartEventPropertiesSchema => ({
  'Swatch Name': payload.variant.name,
  'Swatch SKU': payload.variant.sku,
  'Related Product': payload.swatchRelatedProductSlug ?? '',
});

export const buildDYAddToCartProperties = (
  payload: DYAddToCartTriggerPayloadSchema
): DYAddToCartEventPropertiesSchema => {
  const { cartLineItems, variant, targetPrice } = payload;
  const trackableItems = cartLineItems.filter((item) => !item.is_swatch);

  return {
    dyType: 'add-to-cart-v1',
    value: targetPrice * variant.quantity,
    currency: INTL_CURRENCY ?? '',
    productId: variant.sku,
    quantity: variant.quantity,
    cart: trackableItems.map(buildDYAddToCartItem),
  };
};

export const buildDYAddToCartPropertiesV2 = (
  payload: DYAddToCartTriggerPayloadSchemaV2
): DYAddToCartEventPropertiesSchema => {
  const { cartLineItems, targetLineItem, targetPrice } = payload;
  const { variant, quantity } = targetLineItem;
  const trackableItems = cartLineItems.filter((item) => item.productType !== ProductTypeMapping.SWATCH);

  return {
    dyType: 'add-to-cart-v1',
    value: targetPrice * quantity,
    currency: INTL_CURRENCY ?? '',
    productId: variant.sku,
    quantity,
    cart: trackableItems.map(buildDYAddToCartItemV2),
  };
};

export const buildDYAddToWishlistProperties = (
  payload: DYAddToWishlistTriggerPayloadSchema
): DYAddToWishlistEventPropertiesSchema => ({
  dyType: 'add-to-wishlist-v1',
  productId: payload.variant.sku,
});

export const buildDYKeywordSearchProperties = (
  payload: DYKeywordSearchTriggerPayloadSchema
): DYKeywordSearchEventPropertiesSchema => ({
  dyType: 'keyword-search-v1',
  keywords: payload.keywords,
});

export const buildDYFilterItemsProperties = (
  payload: DYFilterItemsTriggerPayloadSchema
): DYFilterItemsEventPropertiesSchema => ({
  dyType: 'filter-items-v1',
  filterType: payload.type,
  filterStringValue: payload.value,
});

export const buildDYSwatchPurchaseProperties = (
  payload: DYSwatchPurchaseTriggerPayloadSchema
): DYSwatchPurchaseEventPropertiesSchema => ({
  'Swatch SKUs': `${payload.swatches.map((swatch) => swatch.variant.sku).join(', ')}`,
});

export const buildDYPurchaseProperties = (order: DYPurchaseOrderSchema): DYPurchaseEventPropertiesSchema => {
  const trackableItems = order.line_items.filter((item) => !item.is_swatch);

  return {
    dyType: 'purchase-v1',
    value: order.total,
    currency: order.currency,
    uniqueTransactionId: order.number.slice(0, DY_UNIQUE_TX_ID_MAX_LENGTH),
    cart: trackableItems.map(buildDYPurchaseCartItem),
  };
};

export const buildDYRemoveFromCartProperties = (
  payload: DYRemoveFromCartTriggerPayloadSchema
): DYRemoveFromCartEventPropertiesSchema => {
  const { variant, quantity, cartLineItems, targetPrice } = payload;

  return {
    dyType: 'remove-from-cart-v1',
    value: targetPrice * quantity,
    currency: INTL_CURRENCY ?? '',
    productId: variant.sku,
    quantity,
    cart: cartLineItems.map(buildDYRemoveFromCartCartItem),
  };
};

export const buildDYNewsletterSubscriptionProperties = (
  hashedEmail: string
): DYNewsletterSubscriptionEventPropertiesSchema => ({
  dyType: 'newsletter-subscription-v1',
  hashedEmail,
});

export const buildDYUserIdentificationProperties = (
  dyType: 'signup-v1' | 'login-v1',
  value: { hashedEmail: string } | { cuid: string }
): DYUserIdentificationEventPropertiesSchema => ({
  dyType,
  ...value,
});

export const buildDYPromoCodeEnteredProperties = (
  payload: DYPromoCodeEnteredTriggerPayloadSchema
): DYPromoCodeEnteredEventPropertiesSchema => ({
  dyType: 'enter-promo-code-v1',
  code: payload.promoCode,
});
