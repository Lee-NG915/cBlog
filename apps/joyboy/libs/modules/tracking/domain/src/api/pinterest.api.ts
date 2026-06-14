import { X_ACCESS_TOKEN } from '@castlery/config';
import { api } from '@castlery/shared-redux-services';
import { EcEnv } from '@castlery/config';

export const pinterestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    pinterestConversion: builder.mutation({
      query: ({ data, accessToken }) => ({
        url: !EcEnv.NEXT_PUBLIC_APPLICATION_TEST_TAG ? `/pinterest/conversion` : '/pinterest/conversion?test=true',
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

export const { pinterestConversion } = pinterestApi.endpoints;
