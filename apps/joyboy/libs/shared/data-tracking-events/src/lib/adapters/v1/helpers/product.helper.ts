import { type LineItem, type ProductTaxon, type GAECommerceItem, StockState, SaleState } from '../entities';
import { EnvHelper } from './env.helper';

/**
 * 获取原始金额
 * @param amount
 * @returns
 */
export function getOriginalAmount(amount: number) {
  if (!amount && amount !== 0) {
    return '';
  }
  const unitPriceTaxRate: Record<string, number> = {
    AU: 1.1,
    SG: 1.07,
    US: 1,
  };
  return (amount / unitPriceTaxRate[EnvHelper.country]).toFixed(2);
}

// get backend categories from taxons
export function getBreadcrumbNames(taxons: ProductTaxon[]) {
  if (!Array.isArray(taxons)) {
    return ['', ''];
  }
  const { name } = taxons.find((item) => item.level === 1) || {};
  const { name: subName } = taxons.find((item) => item.level === 2) || {};
  return [name || '', subName || ''];
}
export function getApproximateTax(amount: number) {
  if (!amount && amount !== 0) {
    return '';
  }
  const taxRate: Record<string, number> = {
    AU: 0.1,
    SG: 0.07,
    US: 0,
  };
  return (amount * taxRate[EnvHelper.country]).toFixed(2);
}

export function findBrand(taxons: ProductTaxon[]) {
  const taxon = taxons && taxons.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
  return taxon ? taxon.name : 'No Brand';
}
export function calcWeeks(leadTime: number) {
  const result = leadTime / 7;
  const start = Math.floor(result);
  const end = Math.floor(result + 1);
  return `${start}-${end} weeks`;
}
export function calcApproximateTax(total: string, taxTotal: string) {
  return EnvHelper.accessInUS ? (+taxTotal).toFixed(2) : getApproximateTax(Number(total) - Number(taxTotal));
}

export const trackedPosProducts = (items: LineItem[], quantityDifference = 0): GAECommerceItem[] => {
  return items.map((item: LineItem) => {
    const { variant, quantity, stock_state: stockState, delivery_lead_time: deliveryLeadTime } = item;
    const { sku, name, price, list_price: listPrice, product_taxons: productTaxons } = variant;
    const originalPrice = getOriginalAmount(Number(price));
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
      dimension3: isSale ? SaleState.SALE : SaleState.FULL, // is product in sale, values: sale, full
      dimension4: stockState === StockState.OUT_OF_STOCK ? 'Long Time' : calcWeeks(deliveryLeadTime), // delivery time, values: 0-1 week, 1-2 weeks, 2-3 weeks, etc..
      quantity: Math.abs(qty), // amount of units being checked out , Or amount of units adding to cart(Or removing from cart).
      metric1: isSale ? originalDiscountAmount : '', // amount of discount if applicable, if not leave empty string
      ...(!!quantityDifference && { metric2: (qty * Number(originalPrice)).toFixed(2) }), // for cart, increased/decreased amount
    };
  });
};

export const trackedProductsFuncMap = new Map([['POS', trackedPosProducts]]);
export const trackedProducts = trackedProductsFuncMap.get(EnvHelper.client) || trackedPosProducts;
