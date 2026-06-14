import type { AddToCartSource, CartItem, Order } from './types';

export interface CartItemAddedPayload {
  cartId: string;
  item: CartItem;
  source: AddToCartSource;
}

export interface OrderPurchasedPayload {
  order: Order;
}

export type DomainAction =
  | { type: 'cart/itemAdded'; payload: CartItemAddedPayload }
  | { type: 'order/purchased'; payload: OrderPurchasedPayload };

export const cartItemAddedEvent = (payload: CartItemAddedPayload): DomainAction => ({
  type: 'cart/itemAdded',
  payload,
});

export const orderPurchasedEvent = (payload: OrderPurchasedPayload): DomainAction => ({
  type: 'order/purchased',
  payload,
});
