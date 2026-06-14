import { createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '@castlery/utils';
import { EcEnv } from '@castlery/config';

export const getReviewListByPageTest = createAsyncThunk(
  'review/getReviewListByPage',
  async (payload: { page: number; per_page: number }, { rejectWithValue }) => {
    const { page = 1, per_page } = payload;
    try {
      const result = await get(`${EcEnv.NEXT_PUBLIC_API_HOST}/gw/reviews/all?page=${page}&per_page=${per_page}`, {});
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getReviewListByPage = async (payload: { page: number; per_page: number }) => {
  const { page = 1, per_page } = payload;
  const result = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/gw/reviews/all?page=${page}&per_page=${per_page}`, {});
  if (!result.ok) {
    throw new Error('Failed to fetch review list');
  }
  return result.json();
};
