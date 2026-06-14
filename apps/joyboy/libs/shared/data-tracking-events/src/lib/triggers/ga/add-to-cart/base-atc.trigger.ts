import {
  EnvHelper,
  ObjHelper,
  SalesHelper,
  trackedProducts,
  type Customer,
  type GAECommerceItem,
  type LineItem,
  type Sales,
} from '../../../adapters';
import { GaMetricsCustom } from '../../../metrics';

export interface BaseAddToCart<T extends GAECommerceItem = GAECommerceItem> {
  event: GaMetricsCustom.add_to_cart;
  ecommerce: {
    currencyCode: string;
    add: {
      products: T[];
    };
  };
}
export type AtcCategory = 'retrieve_online_cart' | 'offline_atc' | 'push_to_online';

/**
 * Represents the arguments for the offlineAddToCart trigger.
 */
export interface OfflineAddToCartArgs {
  lineItems: LineItem[];
  sales: Sales;
  atcCategory: AtcCategory;
  customer?: Customer | null;
  transactionId: string;
}

export interface OfflineAddToCartDataLayer extends BaseAddToCart {
  eventDetails: {
    /**
     * @description retrieve_online_cart: The event is triggered by adding online cart items to Pos cart
     * @description offline_atc: The event is triggered by adding products to the offline cart
     * @description push_to_online: The event is triggered by pushing the Pos cart items to the online cart
     */
    category: AtcCategory;
  };
  sales: Pick<Sales, 'id' | 'name'>;
  customer?: Pick<Customer, 'id' | 'email'> | null;
  transactionId: string;
}

/**
 * @scene triggered when adding items to the cart successfully.
 * @param args
 * @returns
 */
export const offlineAddToCart = (args: OfflineAddToCartArgs): OfflineAddToCartDataLayer => {
  const { lineItems, customer = null, sales, atcCategory, transactionId } = args;
  const products = lineItems.filter((lineItem) => !lineItem.is_swatch);
  const customerObj = ObjHelper.get(customer, ['id', 'email']);
  const salesObj = { id: sales.id, name: SalesHelper.getFullName(sales) };

  return {
    event: GaMetricsCustom.add_to_cart,
    ecommerce: {
      currencyCode: EnvHelper.currency,
      add: {
        products: trackedProducts(products),
      },
    },
    eventDetails: {
      category: atcCategory,
    },
    customer: customerObj as any,
    sales: salesObj,
    transactionId,
  };
};

export interface OnlineAddToCartArgs {
  lineItems: LineItem[];
  customer?: Customer | null;
  cartQuantityDifference?: number /** nextCart.item_count - preCart.item_count; */;
}
export interface OnlineAddToCartDataLayer {
  event: GaMetricsCustom.add_to_cart;
  ecommerce: {
    currencyCode: string;
    add: {
      products: GAECommerceItem[];
    };
  };
  userStatus: 'logged-in' | 'logged-out';
  userEmail: string;
  userEmail2: string;
}

export const onlineAddToCart = (args: OnlineAddToCartArgs): OnlineAddToCartDataLayer => {
  const { lineItems, customer = null, cartQuantityDifference = 0 } = args;
  const products = lineItems.filter((lineItem) => !lineItem.is_swatch);
  const user = ObjHelper.get(customer, ['emailHashed', 'email']);

  return {
    event: GaMetricsCustom.add_to_cart,
    ecommerce: {
      currencyCode: EnvHelper.currency,
      add: {
        products: trackedProducts(products, cartQuantityDifference),
      },
    },
    userStatus: user?.email ? 'logged-in' : 'logged-out',
    userEmail: user?.emailHashed || '',
    userEmail2: user?.email || '',
  };
};

export const onlineWebAddToCart = (args: OnlineAddToCartArgs): OnlineAddToCartDataLayer => {
  const { lineItems, customer = null, cartQuantityDifference = 0 } = args;
  const products = lineItems.filter((lineItem) => !lineItem.is_swatch);
  const user = ObjHelper.get(customer, ['emailHashed', 'email']);

  return {
    event: GaMetricsCustom.add_to_cart,
    ecommerce: {
      currencyCode: EnvHelper.currency,
      add: {
        products: trackedProducts(products, cartQuantityDifference),
      },
    },
    userStatus: user?.email ? 'logged-in' : 'logged-out',
    userEmail: user?.emailHashed || '',
    userEmail2: user?.email || '',
  };
};
