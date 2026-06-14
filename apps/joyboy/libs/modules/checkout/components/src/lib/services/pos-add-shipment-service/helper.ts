import { changeServiceType } from '@castlery/modules-checkout-domain';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeServiceTypeCommand = createAsyncThunk(
  'checkout/changeServiceType',
  async (
    payload: { shipmentId: number; serviceType: string; waiveFee: boolean },
    { dispatch, getState, rejectWithValue }
  ) => {
    const rootState = getState() as any;
    const number = selectCurrentOrderNumber(rootState);
    if (!number) {
      return rejectWithValue('Order number is not found');
    }
    const res = await dispatch(changeServiceType.initiate({ number, ...payload }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);
