import { INTL_CURRENCY } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import type {
  PinterestAddPaymentInfoCustomDataSchema,
  PinterestAddPaymentInfoTriggerPayloadSchema,
  PinterestAddSwatchToCartTriggerPayloadSchema,
  PinterestAddToWishlistTriggerPayloadSchema,
  PinterestProductCustomDataSchema,
  PinterestProductTriggerPayloadSchema,
  PinterestPurchaseCustomDataSchema,
  PinterestPurchaseTriggerPayloadSchema,
  PinterestRegistrationCustomDataSchema,
  PinterestSwatchCustomDataSchema,
  PinterestSwatchPurchaseTriggerPayloadSchema,
  PinterestInitiateCheckoutCustomDataSchema,
  PinterestInitiateCheckoutTriggerPayloadSchema,
  PinterestNewCustomerPurchaseTriggerPayloadSchema,
  PinterestNewCustomerPurchaseCustomDataSchema,
} from '../entity';

export type PinterestCapiLogEvent =
  | 'page_visit'
  | 'add_to_cart'
  | 'add_swatch_to_cart'
  | 'add_to_wishlist'
  | 'signup'
  | 'newsletter_subscription'
  | 'purchase'
  | 'swatch_purchase'
  | 'initiate_checkout'
  | 'add_payment_info'
  | 'new_customer_purchase';

const PINTEREST_CAPI_LOG_PREFIX = '[Pinterest CAPI]';

export const logPinterestCapiInfo = (
  event: PinterestCapiLogEvent,
  info: string,
  extra?: Record<string, unknown>
): void => {
  logger.info(`${PINTEREST_CAPI_LOG_PREFIX} ${event}: ${info}`, {
    info,
    ...extra,
  });
};

export const logPinterestCapiWarn = (
  event: PinterestCapiLogEvent,
  reason: string,
  extra?: Record<string, unknown>
): void => {
  logger.warn(`${PINTEREST_CAPI_LOG_PREFIX} ${event}: ${reason}`, {
    reason,
    ...extra,
  });
};

export const logPinterestCapiError = (
  event: PinterestCapiLogEvent,
  error: unknown,
  extra?: Record<string, unknown>
): void => {
  logger.error(`${PINTEREST_CAPI_LOG_PREFIX} ${event}:`, {
    error,
    ...extra,
  });
};

export const buildPinterestProductCustomData = (
  payload: PinterestProductTriggerPayloadSchema
): PinterestProductCustomDataSchema => ({
  value: payload.originalPrice,
  currency: INTL_CURRENCY as string,
  content_name: payload.variant.name,
  content_ids: [payload.variant.sku],
});

export const buildPinterestWishlistCustomData = (
  payload: PinterestAddToWishlistTriggerPayloadSchema
): PinterestProductCustomDataSchema => ({
  value: payload.variant.price,
  currency: INTL_CURRENCY as string,
  content_name: payload.variant.name,
  content_ids: [payload.variant.sku],
});

export const buildPinterestSwatchCustomData = (
  payload: PinterestAddSwatchToCartTriggerPayloadSchema | PinterestSwatchPurchaseTriggerPayloadSchema
): PinterestSwatchCustomDataSchema => ({
  content_ids: 'swatchSkus' in payload ? payload.swatchSkus : [payload.variant.sku],
});

export const buildPinterestRegistrationCustomData = (contentName: string): PinterestRegistrationCustomDataSchema => ({
  value: 0.0,
  currency: INTL_CURRENCY as string,
  content_name: contentName,
});

export const buildPinterestPurchaseCustomData = (
  payload: PinterestPurchaseTriggerPayloadSchema
): PinterestPurchaseCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY as string,
  content_ids: payload.contentIds,
  contents: payload.contents,
  order_id: payload.orderId,
});

export const buildPinterestInitiateCheckoutCustomData = (
  payload: Omit<PinterestInitiateCheckoutTriggerPayloadSchema, 'eventId'>
): PinterestInitiateCheckoutCustomDataSchema => ({
  value: +payload.value,
  currency: INTL_CURRENCY as string,
  num_items: payload.numItems,
  content_ids: payload.variants.map((variant) => variant.sku),
});

export const buildPinterestAddPaymentInfoCustomData = (
  payload: PinterestAddPaymentInfoTriggerPayloadSchema
): PinterestAddPaymentInfoCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY as string,
  content_ids: payload.contentIds,
});

export const buildPinterestNewCustomerPurchaseCustomData = (
  payload: PinterestNewCustomerPurchaseTriggerPayloadSchema
): PinterestNewCustomerPurchaseCustomDataSchema => ({
  value: payload.value,
  currency: INTL_CURRENCY as string,
  content_ids: payload.contentIds,
  order_id: payload.orderId,
  contents: payload.contents,
});
