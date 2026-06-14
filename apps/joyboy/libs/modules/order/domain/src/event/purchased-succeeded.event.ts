import { createAction } from '@reduxjs/toolkit';
import type { OrderDataV1 } from '@castlery/types';

export type PurchasedSucceededPayload = {
  order: OrderDataV1;
};

export const purchasedSucceededEvent = createAction<PurchasedSucceededPayload>('order/purchasedSucceededEvent');
