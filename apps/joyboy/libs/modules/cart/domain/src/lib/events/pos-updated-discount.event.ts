import { manualSetDiscount, overWriteServicePrice } from '../api/cart-pos.api';

export const posUpdatedDiscountEvent = manualSetDiscount.matchFulfilled;
export const posUpdatedServicePriceEvent = overWriteServicePrice.matchFulfilled;
