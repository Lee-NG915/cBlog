import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearPosOrderIdAndOrderNumber } from '@castlery/modules-order-domain';
import { clearPosOrderPayments } from '@castlery/modules-payment-domain';

export const clearPosOrderIdAndPayments = createAsyncThunk(
  'order/clearPosOrderIdAndPayments',
  async (_, { dispatch }) => {
    await dispatch(clearPosOrderIdAndOrderNumber());
    await dispatch(clearPosOrderPayments());
  }
);
