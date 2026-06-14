import { apiV1 } from '@castlery/shared-redux-services';
import type { CheckoutAddressEntity_V2 } from '@castlery/types';
import { X_CHECKOUT_TOKEN, accessInPos } from '@castlery/config';

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const checkoutAddressApi = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 获取checkout可用的地址列表，和user地址列表区别是：携带了配送相关属性
     */
    getCheckoutAddressList: builder.query<{ data: CheckoutAddressEntity_V2[] }, void>({
      query: () => ({
        url: accessInPos ? '/api/v1/pos/checkout/addresses' : '/api/v1/checkout/addresses',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 验证地址是否可配送
     * 需要全局拦截做错误提示
     */
    validateAddressForShippingAndUpdate: builder.mutation<
      void,
      { addressId: number; type: 'shipAddress' | 'billAddress' }
    >({
      query: ({ addressId, type }) => ({
        url: accessInPos
          ? '/api/v1/pos/checkout/address/validate-and-update'
          : '/api/v1/checkout/address/validate-and-update',
        method: 'PUT',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: {
          addressId,
          type: type === 'billAddress' ? 'billing' : 'shipping',
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    validateCheckoutAddress: builder.mutation<void, { addressId: number }>({
      query: ({ addressId }) => ({
        url: accessInPos ? '/api/v1/pos/checkout/address/validate' : '/api/v1/checkout/address/validate',
        method: 'POST',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: {
          addressId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});

export const {
  useGetCheckoutAddressListQuery,
  useValidateAddressForShippingAndUpdateMutation,
  useLazyGetCheckoutAddressListQuery,
  useValidateCheckoutAddressMutation,
} = checkoutAddressApi;
export const { getCheckoutAddressList, validateAddressForShippingAndUpdate, validateCheckoutAddress } =
  checkoutAddressApi.endpoints;
