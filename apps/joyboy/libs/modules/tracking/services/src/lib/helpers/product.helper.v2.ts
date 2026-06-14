import { STOCK_STATE } from '@castlery/utils';
import type { LineItemSchema, LineItemVariantSchema } from '@castlery/types';
import { EcEnv } from '@castlery/config';
import type { GAEccProductSchema } from '../entity';
import {
  getOriginalAmount,
  getBreadcrumbNames,
  findBrand,
  calcWeeks,
  getProductImageUrl,
  getProductLink,
} from './product.helper';

export function getVariantLinkV2(variant: LineItemVariantSchema, productSlug: string) {
  let link = getProductLink(productSlug || variant.productSlug);
  if (!link) {
    return null;
  }

  if (variant.variantOptionValues !== undefined) {
    const variantQueryArr = variant.variantOptionValues.map((option) => `${option.optionTypeName}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function getProductUrlV2(variant: LineItemVariantSchema, productSlug: string) {
  const prefix = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME;
  const baseRoute = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  return `${prefix}/${baseRoute}/${getVariantLinkV2(variant, productSlug)}`;
}

export function getProductNeedTrackingV2(lineItem: LineItemSchema | null, quantityDifference = 0) {
  if (!lineItem) return null;
  const { variant, quantity, stock_state: stockState, leadTime: deliveryLeadTime } = lineItem;
  const { sku, name, price, listPrice, productTaxons } = variant;
  const originalPrice = getOriginalAmount(price);
  const [pageName, subPageName] = getBreadcrumbNames(productTaxons);
  const brand = findBrand(productTaxons);
  const originalDiscountAmount = getOriginalAmount(Number(listPrice) - Number(price));
  const isSale = +originalDiscountAmount > 0;
  let qty;
  if (quantityDifference) {
    qty = +quantityDifference;
  } else {
    qty = quantity;
  }
  return {
    id: sku,
    name,
    price: originalPrice,
    category: subPageName, // second category
    brand, // collection name
    dimension1: pageName, // first category
    dimension2: stockState, // stock state, values: IN_STOCK, OUT_OF_STOCK, IN_STOCK_SOON
    dimension3: isSale ? 'sale' : 'full', // is product in sale, values: sale, full
    dimension4: stockState === STOCK_STATE.OUT_OF_STOCK ? 'Long Time' : calcWeeks(deliveryLeadTime), // delivery time, values: 0-1 week, 1-2 weeks, 2-3 weeks, etc..
    quantity: Math.abs(qty), // amount of units being checked out , Or amount of units adding to cart(Or removing from cart).
    metric1: isSale ? originalDiscountAmount : '', // amount of discount if applicable, if not leave empty string
    ...(!!quantityDifference && { metric2: (qty * Number(originalPrice)).toFixed(2) }), // for cart, increased/decreased amount
  };
}

export function getProductsNeedTrackingV2(lineItems: LineItemSchema[], quantityDifference = 0) {
  return lineItems.map((item) => getProductNeedTrackingV2(item, quantityDifference));
}

export function getItemsForKlaviyoV2(lineItems: LineItemSchema[]) {
  if (!lineItems) {
    return [];
  }
  return lineItems.map((item) => {
    const { quantity, variant } = item;
    const { id, sku, price, productTaxons, images, productSlug, productName } = variant;
    const [pageName, subPageName] = getBreadcrumbNames(productTaxons);

    return {
      ProductID: id,
      SKU: sku,
      ProductName: productName,
      Quantity: quantity,
      ItemPrice: +price,
      RowTotal: Number(price) * quantity,
      ProductURL: getProductUrlV2(variant, productSlug),
      ImageURL: getProductImageUrl(images as any),
      ProductCategories: [pageName, subPageName],
    };
  });
}

/**
 * @description Get GA Ecommerce formatted product for GA Tracking Events - For ORP
 * @param lineItem - LineItemSchema
 * @param quantityDifference - number
 * @returns GAECommerceItem {
 *   id: string;
 *   name: string;
 *   price: string;
 *   category: string;
 *   brand: string;
 *   dimension1: string;
 *   dimension2: string;
 *   dimension3: 'sale' | 'full';
 *   dimension4: string;
 *   quantity: number;
 *   metric1: string;
 *   metric2?: string;
 * }
 * @returns
 */
export function getGAEccFormattedProduct(
  lineItem: LineItemSchema | null,
  /**
   * required for cart: increased/decreased amount, positive number for add, negative number for remove
   * optional for checkout: use the quantity of the line item
   */
  quantityDifference?: number
): GAEccProductSchema | null {
  if (!lineItem) return null;
  const { variant, quantity, stockStatus, leadTime, priceExclTax } = lineItem;
  const { sku, name, productTaxons, price, listPrice } = variant;

  const originalPrice = getOriginalAmount(price);
  const originalDiscountAmount = getOriginalAmount(Number(listPrice) - Number(price));
  const isSale = +originalDiscountAmount > 0;

  const [pageName, subPageName] = getBreadcrumbNames(productTaxons);
  const brand = findBrand(productTaxons);

  let qty = 0;
  if (quantityDifference) {
    qty = +quantityDifference;
  } else {
    qty = quantity;
  }

  return {
    id: sku,
    name,
    price: originalPrice,
    category: subPageName,
    brand,
    dimension1: pageName,
    dimension2: stockStatus,
    dimension3: isSale ? 'sale' : 'full',
    dimension4: stockStatus === STOCK_STATE.OUT_OF_STOCK ? 'Long Time' : calcWeeks(leadTime),
    quantity: Math.abs(qty),
    metric1: isSale ? originalDiscountAmount : '',
    ...(!!quantityDifference && { metric2: (qty * Number(priceExclTax)).toFixed(2) }),
  };
}

export function getGAEccFormattedProducts(lineItems: LineItemSchema[], quantityDifference = 0) {
  return lineItems.map((item) => getGAEccFormattedProduct(item, quantityDifference));
}

export function getItemsTotalExclTax(lineItems: LineItemSchema[]) {
  return lineItems.reduce((acc, item) => acc + (+item.totalExclTax || 0), 0).toFixed(2);
}
