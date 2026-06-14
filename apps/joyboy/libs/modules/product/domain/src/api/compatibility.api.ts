import { get } from '@castlery/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetARModelParams } from '../entity/sketchfab.entity';

export const getARModel = createAsyncThunk(
  'compatibility/getARModel',
  async ({ uid, platform }: GetARModelParams, { rejectWithValue }) => {
    try {
      const sketchfabUrl = `https://sketchfab.com/i/archives/ar?model=${uid}&platform=${platform}`;
      const result = await get(
        sketchfabUrl,
        {
          cacheOption: 'no-store',
        },
        undefined,
        1
      );
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);
