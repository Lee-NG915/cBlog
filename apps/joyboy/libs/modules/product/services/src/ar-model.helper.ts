import { createAsyncThunk } from '@reduxjs/toolkit';
import { getARModel, GetARModelParams } from '@castlery/modules-product-domain';

/**
 * 获取 AR 模型 URL 的 command
 */
export const getARModelCommand = createAsyncThunk(
  'product/getARModelCommand',
  async ({ uid, platform }: GetARModelParams, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(getARModel({ uid, platform }));

      if (getARModel.fulfilled.match(result)) {
        return {
          success: true,
          payload: result.payload,
        };
      } else {
        return rejectWithValue(result.payload || 'Failed to get AR model URL');
      }
    } catch (error: any) {
      return rejectWithValue(error?.message || 'An error occurred while getting AR model URL');
    }
  }
);
