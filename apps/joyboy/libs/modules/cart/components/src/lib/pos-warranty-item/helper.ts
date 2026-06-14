import { createAsyncThunk } from '@reduxjs/toolkit';
import { addItemQuantity, reduceItemQuantity, selectCurrentOrderNumber } from '@castlery/modules-order-domain';

export const changeWarrantyItemQuantity = createAsyncThunk(
  'order/changeWarrantyItemQuantity',
  async (
    payload: { lineItemId: string; quantity: number; warrantyId?: string },
    { dispatch, rejectWithValue, getState }
  ) => {
    const rootState = getState() as any;

    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('No order number!');
    }
    const options = payload.warrantyId ? { warranty_offer_id: payload.warrantyId } : {};
    const params = {
      orderNumber,
      lineItemId: payload.lineItemId,
      quantity: payload.quantity,
      options,
    };
    const res = payload.warrantyId
      ? await dispatch(addItemQuantity.initiate(params))
      : await dispatch(reduceItemQuantity.initiate(params));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res?.data;
  }
);
