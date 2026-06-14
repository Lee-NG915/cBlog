import { apiV1 } from '@castlery/shared-redux-services';
import type { CustomerAddressEntity_V2 } from '@castlery/types';
import { accessInPos } from '@castlery/config';

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const addressesApiV2 = apiV1.injectEndpoints({
  endpoints: (builder) => {
    return {
      getUserAddressListV2: builder.query<CustomerAddressEntity_V2[], void>({
        query: () => ({
          url: accessInPos ? '/api/v2/pos/users/addresses/' : '/api/v2/users/addresses/',
          method: 'GET',
        }),
        transformResponse: (response: any) => {
          if (response.code !== 0) {
            throw new Error(JSON.stringify(response));
          }
          return response.data.addresses;
        },
      }),
      updateCustomerAddressV2: builder.mutation<CustomerAddressEntity_V2, { address: CustomerAddressEntity_V2 }>({
        query: ({ address }) => ({
          url: accessInPos ? '/api/v2/pos/users/addresses/' : '/api/v2/users/addresses/',
          method: 'PUT',
          body: { ...address },
        }),
        transformResponse: transformResponseHandler,
      }),
      createCustomerAddressV2: builder.mutation<CustomerAddressEntity_V2, { address: CustomerAddressEntity_V2 }>({
        query: ({ address }) => ({
          url: accessInPos ? '/api/v2/pos/users/addresses/' : '/api/v2/users/addresses/',
          method: 'POST',
          body: { ...address },
        }),
        transformResponse: transformResponseHandler,
      }),

      //============================ For web refactor ------ end ----- ====================
    };
  },
});

export const { getUserAddressListV2, updateCustomerAddressV2, createCustomerAddressV2 } = addressesApiV2.endpoints;
export const {
  useGetUserAddressListV2Query,
  useLazyGetUserAddressListV2Query,
  useUpdateCustomerAddressV2Mutation,
  useCreateCustomerAddressV2Mutation,
} = addressesApiV2;
