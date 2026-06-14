import { api } from '@castlery/shared-redux-services';
import { tagTypes } from '@castlery/shared-redux-services';
import { UpdateUserTermsVersionRequest, UserTermsVersion } from '@castlery/types';

/**
 * Terms of Use API endpoints
 */
export const termsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserTermsVersion: builder.query<UserTermsVersion, { accessToken?: string }>({
      query: ({ accessToken }) => ({
        url: '/users/terms_of_use_log',
        method: 'GET',
        headers: {
          ...(accessToken ? { 'X-Access-Token': accessToken } : {}),
        },
      }),
      keepUnusedDataFor: 3600,
      providesTags: [tagTypes.User],
    }),

    updateUserTermsVersion: builder.mutation<
      UserTermsVersion,
      { data: UpdateUserTermsVersionRequest; accessToken?: string }
    >({
      query: ({ data, accessToken }) => ({
        url: '/users/terms_of_use_log',
        method: 'PUT',
        body: data,
        headers: {
          ...(accessToken ? { 'X-Access-Token': accessToken } : {}),
        },
      }),
      invalidatesTags: [tagTypes.User],
    }),
  }),
});

export const { useGetUserTermsVersionQuery, useUpdateUserTermsVersionMutation, useLazyGetUserTermsVersionQuery } =
  termsApi;

export const { getUserTermsVersion, updateUserTermsVersion } = termsApi.endpoints;
