import { getCartData } from '../api/cart.api';

export const gotCartDataEvent = getCartData.matchFulfilled;
