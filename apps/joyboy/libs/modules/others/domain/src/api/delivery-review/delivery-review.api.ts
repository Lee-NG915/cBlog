import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '@castlery/utils';
import { EcEnv } from '@castlery/config';

export const getDetailFromDeliveryReview = createAsyncThunk(
  'delivery-review/getDetailFromDeliveryReview',
  async (payload: { token: string }, { rejectWithValue }) => {
    const { token } = payload;
    try {
      const result = await get(`${EcEnv.NEXT_PUBLIC_API_HOST}/delivery_reviews/questionnaire?token=${token}`, {});
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitDeliveryReview = createAsyncThunk(
  'delivery-review/submitDeliveryReview',
  async (payload: { token: string; rating: number } & Record<string, string>, { rejectWithValue }) => {
    const { token, rating, ...answers } = payload;
    try {
      const result = await post(`${EcEnv.NEXT_PUBLIC_API_HOST}/delivery_reviews/submit`, {
        body: { token, rating, ...answers },
      });
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
