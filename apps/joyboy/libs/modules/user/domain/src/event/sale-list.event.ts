import { getSaleList } from '../api/sale-list.api';

export const saleListEvent = getSaleList.matchFulfilled;
