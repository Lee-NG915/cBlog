import { DyMetrics } from '../../../metrics';
import { type Order, findItemFromOrder, formatCart } from '../../../adapters';

export interface DyAddToCartEvent {
  name: DyMetrics.add_to_cart;
  properties: {
    dyType: 'add-to-cart-v1';
    value: number; //total value of the cart, Float (dollars.cents).
    productId: string; // The SKU exactly as it appears in the product feed, 注意是product feed里的SKU
    quantity: number;
    /**
     * Optional, but required for multi-currency sites
     */
    currency?: string; // currency code.
    /**
     * Optional, but recommended
     * Array of objects, each representing a product in the cart. Each object should contain the following fields:
     */
    cart?: {
      productId: string;
      quantity: number;
      itemPrice: number /** Float in the format: dollars.cents  */;
    }[];
  };
}

export interface DyAddToCartArgs {
  currentItemId: string;
  order: Order;
}

export const dyAddToCart = (args: DyAddToCartArgs): DyAddToCartEvent => {
  return {
    name: DyMetrics.add_to_cart,
    properties: {
      dyType: 'add-to-cart-v1',
      ...findItemFromOrder(args.currentItemId, args.order),
      cart: formatCart(args.order),
    },
  };
};
