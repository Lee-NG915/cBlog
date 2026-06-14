import { logger } from '@castlery/observability/client';
import { toPrice } from '@castlery/utils';
import type { Image, LineItem, LineItemSchema } from '@castlery/types';
import type { KlaviyoMoney, KlaviyoProductItemEventSchema } from '../entity';
import { KLAVIYO_EVENTS_NAME } from '../events-name/klaviyo-events-name';
import { findBrand, getBreadcrumbNames, getProductImageUrl, getProductUrl, getProductUrlV2 } from '../helpers';

// doc: https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object#update-_learnq-code-to-use-klaviyo

export type KlaviyoLogEvent =
  | 'identify'
  | 'viewed_product'
  | 'recently_viewed_items'
  | 'added_to_cart'
  | 'started_checkout';

const KLAVIYO_LOG_PREFIX = '[Tracking][Klaviyo]';

export const logKlaviyoWarn = (event: KlaviyoLogEvent, reason: string, extra?: Record<string, unknown>): void => {
  logger.warn(`${KLAVIYO_LOG_PREFIX} ${event}`, {
    reason,
    ...extra,
  });
};

export const logKlaviyoInfo = (event: KlaviyoLogEvent, extra?: Record<string, unknown>): void => {
  logger.info(`${KLAVIYO_LOG_PREFIX} ${event}`, extra);
};

export const logKlaviyoError = (event: KlaviyoLogEvent, error: unknown, extra?: Record<string, unknown>): void => {
  logger.error(`${KLAVIYO_LOG_PREFIX} ${event}`, {
    error,
    ...extra,
  });
};

export const toKlaviyoMoney = (value: string | number | null | undefined): KlaviyoMoney => {
  const amount = Number(value);
  return Number.isFinite(amount) ? toPrice(amount) : '';
};

export const getOriginalPrice = (
  listPrice: string | number | null | undefined,
  salesPrice: string | number | null | undefined
): KlaviyoMoney | null => {
  const listPriceAmount = Number(listPrice);
  const salesPriceAmount = Number(salesPrice);

  if (!Number.isFinite(listPriceAmount) || !Number.isFinite(salesPriceAmount) || listPriceAmount <= salesPriceAmount) {
    return null;
  }

  return toKlaviyoMoney(listPriceAmount);
};

export const compactCategories = (categories: string[]): string[] => categories.filter(Boolean);

export const toOptionsText = (
  variantOptionValues:
    | LineItemSchema['variant']['variantOptionValues']
    | LineItem['variant']['variant_option_values']
    | undefined
): string[] => {
  if (!Array.isArray(variantOptionValues)) {
    return [];
  }

  return variantOptionValues
    .map((option) => {
      const optionTypeName = 'optionTypeName' in option ? option.optionTypeName : option.option_type_name;
      const optionValueName = option.name || option.presentation;

      if (!optionTypeName && !optionValueName) {
        return '';
      }

      return [optionTypeName, optionValueName].filter(Boolean).join(': ');
    })
    .filter(Boolean);
};

export const isTrackableLineItem = (lineItem: LineItem): boolean => {
  return !lineItem.is_region_outdated && lineItem.variant.sellability !== false;
};

export const isTrackableLineItemV2 = (lineItem: LineItemSchema): boolean => {
  return lineItem.status !== 'disabled' && lineItem.isActive && !lineItem.isDeleted && !lineItem.isRegionOutdated;
};

export const buildKlaviyoItem = (lineItem: LineItem): KlaviyoProductItemEventSchema => {
  const { quantity, variant } = lineItem;
  const {
    sku,
    price,
    list_price: listPrice,
    product_taxons: productTaxons,
    images,
    product_slug: productSlug,
    product_name: productName,
    variant_option_values: variantOptionValues,
  } = variant;

  return {
    ProductName: productName,
    Quantity: quantity,
    ImageURL: getProductImageUrl(images),
    ProductURL: getProductUrl(variant, productSlug),
    UnitPrice: {
      OriginalPrice: getOriginalPrice(listPrice, price),
      SalesPrice: toKlaviyoMoney(price),
    },
    RowTotal: toKlaviyoMoney(Number(price) * quantity),
    SKU: sku,
    Categories: compactCategories(getBreadcrumbNames(productTaxons)),
    CollectionName: findBrand(productTaxons),
    OptionsText: toOptionsText(variantOptionValues),
  };
};

export const buildKlaviyoItemV2 = (lineItem: LineItemSchema): KlaviyoProductItemEventSchema => {
  const { quantity, variant } = lineItem;
  const { sku, price, listPrice, productTaxons, images, productSlug, productName, variantOptionValues } = variant;

  return {
    ProductName: productName,
    Quantity: quantity,
    ImageURL: getProductImageUrl(images as Image[]),
    ProductURL: getProductUrlV2(variant, productSlug),
    UnitPrice: {
      OriginalPrice: getOriginalPrice(listPrice, price),
      SalesPrice: toKlaviyoMoney(price),
    },
    RowTotal: toKlaviyoMoney(Number(price) * quantity),
    SKU: sku,
    Categories: compactCategories(getBreadcrumbNames(productTaxons)),
    CollectionName: findBrand(productTaxons),
    OptionsText: toOptionsText(variantOptionValues),
  };
};

/**
 * Type guard to check if Klaviyo instance is available
 */
const isKlInstanceAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window._learnq !== 'undefined';
};

/**
 * Event handler mapping for special Klaviyo events
 */
const KLAVIYO_EVENT_HANDLERS: Record<string, (properties: Record<string, unknown>) => void> = {
  [KLAVIYO_EVENTS_NAME.KL_IDENTIFY]: (properties) => {
    window._learnq.push(['identify', properties] as any);
  },
  [KLAVIYO_EVENTS_NAME.KL_RECENTLY_VIEWED_ITEMS]: (properties) => {
    window._learnq.push(['trackViewedItem', properties] as any);
  },
};

/**
 * Track events to Klaviyo
 * @param event - Event name to track
 * @param properties - Event properties
 * @see https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object#update-_learnq-code-to-use-klaviyo
 */
export const trackKlaviyo = (event: string, properties: Record<string, unknown>): void => {
  if (!isKlInstanceAvailable()) {
    logKlaviyoError('trackKlaviyo' as any, new Error('Klaviyo instance is not available'));
    return;
  }

  const specialHandler = KLAVIYO_EVENT_HANDLERS[event];
  if (specialHandler) {
    try {
      specialHandler(properties);
    } catch (error) {
      logKlaviyoError('trackKlaviyo' as any, error);
    }
    return;
  }

  try {
    window._learnq.push(['track', event, properties] as any);
  } catch (error) {
    logKlaviyoError('trackKlaviyo' as any, error);
  }
};
