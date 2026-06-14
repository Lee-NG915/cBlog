import { getOrderByOrderNumber, createWebOrder } from '../api/order.api';

export const getOrderByOrderNumberEvent = getOrderByOrderNumber.matchFulfilled;

export const webOrderCreatedEvent = createWebOrder.matchFulfilled;
