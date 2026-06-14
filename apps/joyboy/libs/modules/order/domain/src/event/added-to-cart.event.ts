import { addToOrder } from '../api/order.api';

export const webAddedToCartEvent = addToOrder.matchFulfilled;
