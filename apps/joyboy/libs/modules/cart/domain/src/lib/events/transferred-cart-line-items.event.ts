import { transferCartItems } from '../api/cart-pos.api';

export const transferredCartLineItemsEvent = transferCartItems.matchFulfilled;
