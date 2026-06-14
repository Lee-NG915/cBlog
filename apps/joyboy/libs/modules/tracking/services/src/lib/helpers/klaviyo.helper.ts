import { logger } from '@castlery/observability/client';
import { toPrice } from '@castlery/utils';
import type { Image, LineItem, LineItemSchema } from '@castlery/types';
import type { KlaviyoMoney, KlaviyoProductItemEventSchema } from '../entity';
import { findBrand, getBreadcrumbNames, getProductImageUrl, getProductUrl } from './product.helper';
import { getProductUrlV2 } from './product.helper.v2';

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
      SalesPrice: toKlaviyoMoney(price), // 如果 商品使用了应用于原价的优惠，则SalesPrice使用原价
    },
    RowTotal: toKlaviyoMoney(Number(price) * quantity),
    SKU: sku,
    Categories: compactCategories(getBreadcrumbNames(productTaxons)),
    CollectionName: findBrand(productTaxons),
    OptionsText: toOptionsText(variantOptionValues),
  };
};
