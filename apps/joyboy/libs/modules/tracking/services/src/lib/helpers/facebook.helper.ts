import { INTL_CURRENCY } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import type {
  FacebookAddPaymentInfoCustomDataSchema,
  FacebookAddPaymentInfoTriggerPayloadSchema,
  FacebookAddSwatchToCartTriggerPayloadSchema,
  FacebookInitiateCheckoutCustomDataSchema,
  FacebookInitiateCheckoutTriggerPayloadSchema,
  FacebookNewCustomerPurchaseCustomDataSchema,
  FacebookNewCustomerPurchaseTriggerPayloadSchema,
  FacebookProductCustomDataSchema,
  FacebookCapiProductTriggerPayloadSchema,
  FacebookPurchaseCustomDataSchema,
  FacebookPurchaseTriggerPayloadSchema,
  FacebookRegistrationCustomDataSchema,
  FacebookSwatchAddToCartCustomDataSchema,
  FacebookSwatchPurchaseCustomDataSchema,
  FacebookSwatchPurchaseTriggerPayloadSchema,
  FacebookWishlistCustomDataSchema,
  FacebookAddToWishlistTriggerPayloadSchema,
} from '../entity';

export type FacebookCapiLogEvent =
  | 'view_content'
  | 'add_to_cart'
  | 'add_swatch_to_cart'
  | 'add_to_wishlist'
  | 'product_view_more_than_3'
  | 'complete_registration'
  | 'newsletter_subscription'
  | 'act_with_signup'
  | 'initiate_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'swatch_purchase'
  | 'new_customer_purchase';

const FACEBOOK_CAPI_LOG_PREFIX = '[FB CAPI]';

export const logFacebookCapiWarn = (
  event: FacebookCapiLogEvent,
  reason: string,
  extra?: Record<string, unknown>
): void => {
  logger.warn(`${FACEBOOK_CAPI_LOG_PREFIX} ${event}: ${reason}`, extra);
};

export const logFacebookCapiInfo = (event: FacebookCapiLogEvent, extra?: Record<string, unknown>): void => {
  logger.info(`${FACEBOOK_CAPI_LOG_PREFIX} ${event}`, extra);
};

export const logFacebookCapiError = (
  event: FacebookCapiLogEvent,
  error: unknown,
  extra?: Record<string, unknown>
): void => {
  logger.error(`${FACEBOOK_CAPI_LOG_PREFIX} ${event}:`, {
    error,
    ...extra,
  });
};

export const buildFacebookProductCustomData = (
  payload: FacebookCapiProductTriggerPayloadSchema
): FacebookProductCustomDataSchema => ({
  value: payload.originalPrice,
  currency: INTL_CURRENCY,
  content_name: payload.variant.name,
  content_ids: [payload.variant.sku],
  content_type: 'product',
});

export const buildFacebookSwatchAddToCartCustomData = (
  payload: FacebookAddSwatchToCartTriggerPayloadSchema
): FacebookSwatchAddToCartCustomDataSchema => ({
  content_category: 'Swatch',
  content_ids: [payload.variant.sku],
  content_name: payload.variant.name,
  related_product_id: payload.swatchRelatedProductId as number,
});

export const buildFacebookWishlistCustomData = (
  payload: FacebookAddToWishlistTriggerPayloadSchema
): FacebookWishlistCustomDataSchema => ({
  value: +payload.variant.price,
  currency: INTL_CURRENCY,
  content_name: payload.variant.name,
  content_ids: [payload.variant.sku],
});

export const buildFacebookRegistrationCustomData = (contentName: string): FacebookRegistrationCustomDataSchema => ({
  value: 0.0,
  currency: INTL_CURRENCY,
  content_name: contentName,
});

export const buildFacebookInitiateCheckoutCustomData = (
  payload: FacebookInitiateCheckoutTriggerPayloadSchema
): FacebookInitiateCheckoutCustomDataSchema => ({
  value: +payload.itemTotal,
  currency: INTL_CURRENCY,
  num_items: payload.numItems,
  content_ids: payload.lineItems.map((item) => item.variant.sku),
});

export const buildFacebookAddPaymentInfoCustomData = (
  payload: FacebookAddPaymentInfoTriggerPayloadSchema
): FacebookAddPaymentInfoCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY,
  content_ids: payload.contentIds,
});

export const buildFacebookPurchaseCustomData = (
  payload: FacebookPurchaseTriggerPayloadSchema
): FacebookPurchaseCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY,
  order_id: payload.orderId,
  content_ids: payload.contentIds,
  content_type: payload.contentType,
  contents: payload.contents,
});

export const buildFacebookSwatchPurchaseCustomData = (
  payload: FacebookSwatchPurchaseTriggerPayloadSchema
): FacebookSwatchPurchaseCustomDataSchema => ({
  content_ids: payload.swatchSkus,
  content_category: 'Swatch',
  content_type: 'swatch',
});

export const buildFacebookNewCustomerPurchaseCustomData = (
  payload: FacebookNewCustomerPurchaseTriggerPayloadSchema
): FacebookNewCustomerPurchaseCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY,
  order_id: payload.orderId,
  content_type: 'product',
  contents: payload.contents,
  content_ids: payload.contentIds,
});
