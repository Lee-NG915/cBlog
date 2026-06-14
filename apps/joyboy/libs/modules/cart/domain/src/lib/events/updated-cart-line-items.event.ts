import { isAnyOf } from '@reduxjs/toolkit';
import {
  updateCartItemQty,
  removeCartItem,
  cartUndoAction,
  addLineItemToCart,
  addGiftToCart,
  updateGiftInCart,
} from '../api/cart-item.api';
import { refreshCart, mergeCart } from '../api/cart.api';
import { removeWarranty, addWarranty } from '../api/warranty.api';
import { updatedZipcodeInCartEvent } from './updated-cart-zipcode.event';

export const refreshedCartEvent = refreshCart.matchFulfilled;
export const updatedCartItemQtyEvent = updateCartItemQty.matchFulfilled;
export const removedCartItemEvent = removeCartItem.matchFulfilled;
export const addedCartItemEvent = addLineItemToCart.matchFulfilled;
export const undoRemoveCartItemEvent = cartUndoAction.matchFulfilled;
export const mergedCartEvent = mergeCart.matchFulfilled;

export const cartUpdatedEvent = isAnyOf(
  mergeCart.matchFulfilled,
  refreshCart.matchFulfilled,
  updateCartItemQty.matchFulfilled,
  cartUndoAction.matchFulfilled,
  addWarranty.matchFulfilled,
  removeWarranty.matchFulfilled,
  addLineItemToCart.matchFulfilled,
  removeCartItem.matchFulfilled,
  addGiftToCart.matchFulfilled,
  updateGiftInCart.matchFulfilled,
  updatedZipcodeInCartEvent
);
