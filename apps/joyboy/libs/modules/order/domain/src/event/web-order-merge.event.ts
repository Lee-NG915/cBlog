import { mergeOrder } from '../api/order.api';

export const mergeOrderSuccessEvent = mergeOrder.matchFulfilled;
export const mergeOrderErrorEvent = mergeOrder.matchRejected;
