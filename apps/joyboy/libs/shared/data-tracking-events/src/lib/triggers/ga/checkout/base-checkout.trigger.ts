import { GaMetricsCustom } from '../../../metrics';
import {
  GAECommerceItem,
  trackedProducts,
  type Customer,
  type Sales,
  type Order,
  EnvHelper,
  SalesHelper,
  ObjHelper,
} from '../../../adapters';

export interface BaseCheckoutArgs {
  order: Order;
  customer: Customer;
  sales: Sales;
}

export interface BaseCheckoutDataLayer {
  event: GaMetricsCustom.checkout;
  customer: Omit<Customer, 'email' | 'id'>;
  sales: {
    name: string;
  };
  ecommerce: {
    currencyCode: string;
    add: {
      products: GAECommerceItem[];
    };
  };
}

/**
 * Scenario: When the user clicks the checkout button, the checkout event is triggered
 * @param args
 * @returns
 */
export const baseCheckout = (args: BaseCheckoutArgs): BaseCheckoutDataLayer => {
  const { order, customer, sales } = args;
  const products = order.line_items.filter((lineItem) => !lineItem.is_swatch);

  return {
    event: GaMetricsCustom.checkout,
    customer: ObjHelper.get(customer, ['email', 'id']),
    sales: {
      name: SalesHelper.getFullName(sales),
    },
    ecommerce: {
      currencyCode: EnvHelper.currency,
      add: {
        products: trackedProducts(products),
      },
    },
  };
};
