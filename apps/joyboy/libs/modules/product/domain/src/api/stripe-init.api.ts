import { api } from '@castlery/shared-redux-services';

export const stripeInitApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      generatePos: builder.query({
        query: () => ({
          url: `stripe_terminal_connection_token`,
          method: 'POST',
          // body: {
          // },
        }),
      }),
    };
  },
});

export const { useGeneratePosQuery, useLazyGeneratePosQuery } = stripeInitApi;

export const { generatePos } = stripeInitApi.endpoints;
