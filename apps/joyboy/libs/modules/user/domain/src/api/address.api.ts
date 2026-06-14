import { api } from '@castlery/shared-redux-services';
import type { ParsedGoogleAddressEntity_V2, CustomerAddressEntity } from '@castlery/types';

export type AddressOptions = {
  id: string;
  building_name?: string;
  building_type: string;
  latitude: string;
  longitude: string;
  street: string;
  street_number?: string;
  zipcode: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  state_name?: string;
};
export type GoogleAddressOption = {
  description: string;
  google_place_id: string;
};

export const addressesApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getAddressesByUserId: builder.query<AddressOptions[], number>({
        query: (uid) => `users/${uid}/addresses`,
      }),
      addAddressToUserByUid: builder.mutation<AddressOptions, { uid: number; address: AddressOptions }>({
        query: ({ uid, address }) => ({
          url: `users/${uid}/addresses`,
          method: 'POST',
          body: address,
        }),
      }),
      getGoogleAddressesOptions: builder.query<GoogleAddressOption[], string>({
        query: (query) => `places/autocomplete/?query=${query}`,
      }),
      formatGoogleAddressByPlaceId: builder.query<AddressOptions, string>({
        query: (placeId) => `places/formatted_address?google_place_id=${placeId}`,
      }),
      //============================ For web refactor ------ start----- ====================
      parseGoogleAddressByPlaceId: builder.query<
        ParsedGoogleAddressEntity_V2,
        {
          googlePlaceId: string;
          sessiontoken: string;
        }
      >({
        query: ({ googlePlaceId, sessiontoken }) => ({
          url: `/places/formatted_address`,
          params: {
            google_place_id: googlePlaceId,
            sessiontoken,
          },
        }),
      }),
      updateCustomerAddress: builder.mutation<AddressOptions, { uid: number; address: AddressOptions }>({
        query: ({ uid, address }) => ({
          url: `users/${uid}/addresses`,
          method: 'POST',
          body: address,
        }),
      }),
      createCustomerAddress: builder.mutation<any, { address: any }>({
        query: ({ address }) => ({
          url: `/users/me/addresses`,
          method: 'POST',
          body: { ...address },
        }),
      }),
      deleteCustomerAddress: builder.mutation<any, number>({
        query: (addressId) => ({
          url: `/users/me/addresses`,
          method: 'DELETE',
          body: { address_id: addressId },
        }),
      }),
      getCustomerAddress: builder.query<CustomerAddressEntity[] | [], void>({
        query: () => ({
          url: `/users/me/addresses`,
          method: 'GET',
        }),
      }),

      //============================ For web refactor ------ end ----- ====================
    };
  },
});

export const {
  getAddressesByUserId,
  addAddressToUserByUid,
  getGoogleAddressesOptions,
  formatGoogleAddressByPlaceId,
  parseGoogleAddressByPlaceId,
  updateCustomerAddress,
  createCustomerAddress,
  getCustomerAddress,
  deleteCustomerAddress,
} = addressesApi.endpoints;
export const {
  useGetAddressesByUserIdQuery,
  useGetGoogleAddressesOptionsQuery,
  useFormatGoogleAddressByPlaceIdQuery,
  useLazyGetGoogleAddressesOptionsQuery,
  useLazyFormatGoogleAddressByPlaceIdQuery,
  useParseGoogleAddressByPlaceIdQuery,
  useLazyParseGoogleAddressByPlaceIdQuery,
  useUpdateCustomerAddressMutation,
  useCreateCustomerAddressMutation,
  useGetCustomerAddressQuery,
  useDeleteCustomerAddressMutation,
} = addressesApi;
