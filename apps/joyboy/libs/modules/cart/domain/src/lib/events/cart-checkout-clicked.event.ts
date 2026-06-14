import { createAction } from '@reduxjs/toolkit';

export type CartCheckoutPosition = 'miniCart' | 'fullCart';

export interface CartCheckoutClickedPayload {
  position: CartCheckoutPosition;
}

export const cartCheckoutClickedEvent = createAction<CartCheckoutClickedPayload>('cart/checkoutClicked');
