import { DY_CLIENT_BASE_URL } from '@castlery/config';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dyApi = createApi({
  reducerPath: 'dy-api',
  baseQuery: fetchBaseQuery({
    baseUrl: DY_CLIENT_BASE_URL,
  }),
  endpoints: () => ({}),
});
