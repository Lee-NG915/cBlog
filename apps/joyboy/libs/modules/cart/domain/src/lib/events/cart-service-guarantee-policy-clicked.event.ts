import { createAction } from '@reduxjs/toolkit';

export type CartServiceGuaranteePolicyPosition = 'miniCart' | 'fullCart';

export interface CartServiceGuaranteePolicyClickedPayload {
  label: string;
  position: CartServiceGuaranteePolicyPosition;
}

/**
 * @description User clicked a policy / T&Cs link inside a cart service-guarantee
 *              card. Fires on every click and carries the card title as the GA
 *              label.
 */
export const cartServiceGuaranteePolicyClickedEvent = createAction<CartServiceGuaranteePolicyClickedPayload>(
  'cart/serviceGuaranteePolicyClicked'
);
