import { addLineItemToCart, addGiftToCart } from '../api/cart-item.api';

export const addedCartEvent = addLineItemToCart.matchFulfilled;
export const addedGiftToCartEvent = addGiftToCart.matchFulfilled;
