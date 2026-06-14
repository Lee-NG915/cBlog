import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const YOTPO_BASE_URL = 'https://loyalty.yotpo.com/api/';

export const yotpoBaseApi = createApi({
  reducerPath: 'yotpo-api',
  baseQuery: fetchBaseQuery({ baseUrl: YOTPO_BASE_URL }),
  endpoints: () => ({}),
});
