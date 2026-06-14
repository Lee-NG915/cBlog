import { EcEnv } from '@castlery/config';
import { STOCK_STATE } from '@castlery/utils';
import type { GAEccProductSchema } from '../entity';
import type { LineItem, Image } from '@castlery/types';

const COUNTRY = EcEnv.NEXT_PUBLIC_COUNTRY;

/* For GTM */
export function getOriginalAmount(price: string | number) {
  const amount = price ? Number(price) : 0;
  if (!amount && amount !== 0) {
    return '';
  }
  const unitPriceTaxRate = {
    AU: 1.1,
    SG: 1.09,
    US: 1,
    CA: 1,
    UK: 1.2,
  };
  return (amount / unitPriceTaxRate[COUNTRY]).toFixed(2);
}

export function getApproximateTax(price: string | number) {
  const amount = price ? Number(price) : 0;
  if (!amount && amount !== 0) {
    return '';
  }
  const taxRate = {
    AU: 0.1,
    SG: 0.07,
    US: 0,
    CA: 0,
    UK: 0.2,
  };
  return (amount * taxRate[COUNTRY]).toFixed(2);
}

// get backend categories from taxons
export function getBreadcrumbNames(taxons: { name: string; level: number }[] = []) {
  if (!Array.isArray(taxons) || taxons.length === 0) {
    return ['', ''];
  }
  const { name } = taxons.find((item) => item.level === 1) || {};
  const { name: subName } = taxons.find((item) => item.level === 2) || {};
  return [name ?? '', subName ?? ''];
}

export function findBrand(taxons: { name: string; level: number; ancestors: string[] }[] = []) {
  if (!Array.isArray(taxons) || taxons.length === 0) {
    return 'No Brand';
  }
  const taxon = taxons?.find((t) => t.level === 1 && t.ancestors?.[0] === 'Collections');
  return taxon ? taxon.name : 'No Brand';
}

export function calcWeeks(leadTime: number) {
  const result = leadTime / 7;
  const start = Math.floor(result);
  const end = Math.floor(result + 1);
  return `${start}-${end} weeks`;
}

export function getProductNeedTracking(lineItem: LineItem | null, quantityDifference = 0): GAEccProductSchema | null {
  if (!lineItem) return null;
  const { variant, quantity, stock_state: stockState, delivery_lead_time: deliveryLeadTime } = lineItem;
  const { sku, name, price, list_price: listPrice, product_taxons: productTaxons } = variant;
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

export function getProductsNeedTracking(lineItems: LineItem[], quantityDifference = 0): GAEccProductSchema[] {
  return lineItems.flatMap((item) => {
    const product = getProductNeedTracking(item, quantityDifference);
    return product ? [product] : [];
  });
}

export function getProductImageUrl(images: Image[]) {
  if (!images) return '';
  return images[0]?.links?.medium || images[0]?.links?.large || '';
}

export function getProductLink(slug: string) {
  return `products/${slug}`;
}

// return the link for a variant object
export function getVariantLink(variant: LineItem['variant'], productSlug: string) {
  let link = getProductLink(productSlug || variant.product_slug);
  if (!link) {
    return null;
  }

  if (variant.variant_option_values !== undefined) {
    const variantQueryArr = variant.variant_option_values.map((option) => `${option.option_type_name}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function getProductUrl(variant: LineItem['variant'], productSlug: string) {
  const prefix = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME;
  const baseRoute = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  return `${prefix}/${baseRoute}/${getVariantLink(variant, productSlug)}`;
  //   return `${__ONE_PIECE_WEB_SERVER_NAME__}${__BASE_ROUTE__ + getVariantLink(variant, productSlug)}`;
}

export function getItemsForKlaviyo(lineItems: LineItem[]) {
  if (!lineItems) {
    return [];
  }
  return lineItems.map((item) => {
    const { quantity, variant } = item;
    const {
      id,
      sku,
      price,
      product_taxons: productTaxons,
      images,
      product_slug: productSlug,
      product_name: productName,
    } = variant;
    const [pageName, subPageName] = getBreadcrumbNames(productTaxons);

    return {
      ProductID: id,
      SKU: sku,
      ProductName: productName,
      Quantity: quantity,
      ItemPrice: +price,
      RowTotal: Number(price) * quantity,
      ProductURL: getProductUrl(variant, productSlug),
      ImageURL: getProductImageUrl(images),
      ProductCategories: [pageName, subPageName],
    };
  });
}

export function getCheckoutUrl() {
  const prefix = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME;
  const baseRoute = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  return `${prefix}/${baseRoute}/checkout/account`;
}
