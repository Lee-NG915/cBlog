import { X_ACCESS_TOKEN } from '@castlery/config';
import { api } from '@castlery/shared-redux-services';

export const facebookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    facebookConversionV1: builder.mutation({
      query: ({ data, accessToken }) => ({
        url: `/facebook/conversion`,
        method: 'POST',
        headers: {
          [X_ACCESS_TOKEN]: accessToken,
        },
        body: data,
        keepalive: true,
      }),
    }),
    facebookConversionV2: builder.mutation({
      query: ({ data, accessToken }) => ({
        url: `/v2/facebook/conversion`,
        method: 'POST',
        headers: {
          [X_ACCESS_TOKEN]: accessToken,
        },
        body: data,
        keepalive: true,
      }),
    }),
  }),
});

export const { facebookConversionV1, facebookConversionV2 } = facebookApi.endpoints;
