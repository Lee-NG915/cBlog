import type { CommonGAEvent } from '../../../types';
import {
  type Customer,
  type Order,
  type GAECommerceItem,
  trackedProducts,
  calcApproximateTax,
  EnvHelper,
} from '../../../adapters';
import { GaMetricsCustom } from '../../../metrics';

export interface Transaction<T extends GAECommerceItem = GAECommerceItem> {
  event: GaMetricsCustom.transaction;
  pageContent: string;
  pageProduct: string;
  pageCountry: string;
  pageCat: string;
  pageType: string;
  userID: string; // customer.id||""
  userStatus: 'logged-in' | 'logged-out';
  userType: 'member' | 'guest';
  userEmail: string; // customer.emailHashed||""
  userPhone: string; // customer.phoneHashed||""
  userEmail2: string; // customer.email||""
  isNewCustomer: boolean;
  currencyCode: string;
  transactionId: string; //order number
  transactionId2: string; //reference_number
  transactionTotalsh: string; //total order value incl tax and shipping
  transactionTotal: string; //total order value excl shipping
  transactionTotalNet: string; //total order value excl approximate taxes and shipping
  transactionTotalNetActualTax: string; //total order value excl actual taxes and shipping
  transactionDiscount: string; //total discount value applied to order if applicable
  transactionCoupon: string; //order coupon code if applicable
  transactionPromo: string; //order promo code if applicable
  transactionTax: string; //approximate tax value
  transactionActualTax: string; //actual tax value
  transactionShipping: string; //shipping costs if applicable
  transactionCountry: string; //shipping country
  ecommerce: {
    currencyCode: string;
    purchase: {
      actionField: {
        id: string; // order number
        revenue: string; // total order value excl approximate taxes and shipping
        shipping: string; // order shipping costs
        tax: string; // approximate tax value
        coupon: string; //coupon||"", promo or coupon code if used - if not leave empty
      };
      products: T[];
    };
  };
}

// Usage:
export interface transactionArgs {
  customer?: Customer | null;
  order: Order;
}
export const transaction = (args: transactionArgs): Transaction | CommonGAEvent[] => {
  const { customer = null, order } = args;
  const swatches = order.line_items.filter((lineItem) => lineItem.is_swatch);

  if (swatches && swatches.length) {
    return swatches.map((swatch) => ({
      event: GaMetricsCustom.track_event,
      'eventDetails.category': 'Ecommerce',
      'eventDetails.action': 'Swatch',
      'eventDetails.label': `${swatch.variant.sku} | ${swatch.variant.name}`,
    }));
  }
  const products = order.line_items.filter((lineItem) => !lineItem.is_swatch);
  const trackedOrder = {
    ...order,
    line_items: products,
    item_count: order.item_count - swatches.length,
  };
  let isNewCustomer = false;
  if (customer && order) {
    isNewCustomer = Boolean(order.first_purchase);
  }

  const {
    number,
    reference_number: referenceNumber,
    total,
    shipment_total: shipmentTotal,
    tax_total: taxTotal,
    promo_total: promoTotal,
    coupon,
    promotions,
    line_items: lineItems,
  } = trackedOrder;
  const discount = Math.abs(Number(promoTotal));
  const transactionTotal = Number(total) - Number(shipmentTotal);
  const approximateTax = calcApproximateTax(total, taxTotal);

  return {
    event: GaMetricsCustom.transaction,
    pageContent: 'checkout-confirm',
    pageProduct: 'other',
    pageCountry: EnvHelper.country,
    pageCat: 'checkout',
    pageType: 'checkout',
    userID: customer ? `${customer.id}` : '',
    userStatus: customer ? 'logged-in' : 'logged-out',
    userType: customer ? 'member' : 'guest',
    userEmail: (customer && customer.emailHashed) || '',
    userPhone: (customer && customer.phoneHashed) || '',
    userEmail2: (customer && customer.email) || '',
    isNewCustomer: isNewCustomer, //---------------------- todo -----------------------
    currencyCode: EnvHelper.currency, // currency code
    transactionId: number, // order number
    transactionId2: referenceNumber || '',
    transactionTotalsh: (+total).toFixed(2), // total order value incl tax and shipping
    transactionTotal: transactionTotal.toFixed(2), // total order value excl shipping
    transactionTotalNet: (transactionTotal - Number(approximateTax)).toFixed(2), // total order value excl approximate taxes and shipping
    transactionTotalNetActualTax: (transactionTotal - Number(taxTotal)).toFixed(2), // total order value excl actual taxes and shipping
    transactionDiscount: discount.toFixed(2), // total discount value applied to order if applicable
    transactionCoupon: coupon ? coupon.code : '', //  order coupon code if applicable
    transactionPromo: promotions.length ? promotions[0].name : '', // order promo code if applicable
    transactionTax: approximateTax, // approximate tax value
    transactionActualTax: (+taxTotal).toFixed(2), // actual tax value
    transactionShipping: (+shipmentTotal).toFixed(2), // shipping costs if applicable
    transactionCountry: EnvHelper.country, // shipping country

    ecommerce: {
      currencyCode: EnvHelper.currency, // currency used on page
      purchase: {
        actionField: {
          id: number, // order number
          revenue: (transactionTotal - Number(approximateTax)).toFixed(2), // total order value excl approximate taxes and shipping
          shipping: (+shipmentTotal).toFixed(2), // order shipping costs
          tax: approximateTax, // approximate tax value
          coupon: coupon ? coupon.code : '', // promo or coupon code if used - if not leave empty
        },
        products: trackedProducts(lineItems),
      },
    },
  };
};
