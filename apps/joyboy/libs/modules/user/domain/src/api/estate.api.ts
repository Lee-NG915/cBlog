/* eslint-disable */
import { EcEnv } from '@castlery/config';
import { api } from '@castlery/shared-redux-services';

export const estateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendEstatePromoCode: builder.mutation<void, { email: string; estate: string }>({
      query: ({ email, estate }) => ({
        url: ['CA', 'SG'].includes(EcEnv.NEXT_PUBLIC_COUNTRY)
          ? 'api/v1/estates/registrations'
          : '/estates/registrations',
        method: 'POST',
        body: { email, estate },
      }),
    }),
  }),
});

export const { useSendEstatePromoCodeMutation } = estateApi;
export const { sendEstatePromoCode } = estateApi.endpoints;
