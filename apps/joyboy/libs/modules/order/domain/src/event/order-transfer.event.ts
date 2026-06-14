import { orderItemsTransfer } from '../api/order.api';

export const orderItemsTransferEvent = orderItemsTransfer.matchFulfilled;
export const orderItemsTransferPendingEvent = orderItemsTransfer.matchPending;
