import { apiV1 } from '@castlery/shared-redux-services';
import type { UpdateShippingMethodPayload } from '../entity/checkout.entity';
import { X_CHECKOUT_TOKEN, accessInPos } from '@castlery/config';
import { APIResponseRoot_V2, CheckoutSessionInfoSchema, CustomerAddressEntity_V2 } from '@castlery/types';

const transformResponseHandler = (response: APIResponseRoot_V2) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const checkoutSessionApi = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 获取checkout 基础信息
     * 在shipping-address页面获取
     */
    getCheckoutInfo: builder.query<
      CheckoutSessionInfoSchema,
      {
        noCache?: boolean /** true:do not use cache */;
        needsShippingMethod?: boolean /** This needsShippingMethod takes effect when NoCache is true . true:need shipping method */;
      } | void
    >({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/checkout/info' : '/api/v1/checkout/info',
        method: 'GET',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        params: payload?.noCache
          ? {
              noCache: payload?.noCache,
              needsShippingMethod: payload?.needsShippingMethod ?? false,
            }
          : {},
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 更新checkout session中存储的地址信息
     */
    updateCheckoutAddress: builder.mutation<CustomerAddressEntity_V2[], { checkoutToken: string; addressId: string }>({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/checkout/address' : '/api/v1/checkout/address',
        method: 'PUT',
        body: payload,
      }),
      extraOptions: {
        maxRetries: 0,
      },
    }),
    /**
     * 更新checkout session中的shipping method 信息
     */
    updateCheckoutShippingMethod: builder.mutation<CheckoutSessionInfoSchema, Partial<UpdateShippingMethodPayload>>({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/checkout/shipping-method' : '/api/v1/checkout/shipping-method',
        method: 'PUT',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: payload,
      }),
      transformResponse: transformResponseHandler,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    updateCheckoutAddressZipcode: builder.mutation<void, { zipcode: string; city: string; countryState: string }>({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/checkout/address/zipcode' : '/api/v1/checkout/address/zipcode',
        method: 'PUT',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: payload,
      }),
      transformResponse: transformResponseHandler,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    /**
     * pos checkout page 和 payment page 在同一个页面，所以在生成订单之后需要刷新 checkout page 组件的数据
     * 使用后端提供的新街口 /api/v1/order/detail/checkout-info
     */
    getOrderCheckoutDetail: builder.query<any, string>({
      query: (orderId) => ({
        url: accessInPos ? `/api/v1/pos/order/detail/checkout-info` : `/api/v1/order/detail/checkout-info`,
        method: 'GET',
        params: {
          id: orderId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * GenerateQuotation api
     */
    generateQuotation: builder.mutation<any, void>({
      query: () => ({
        url: `/api/v1/pos/quotation`,
        method: 'POST',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
      }),
      transformResponse: transformResponseHandler,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    /**
     * PreInventoryReserve 预留库存(web 进入payment页面时，即占用库存6min)
     * POST / api / v1 / order / pre - inventory - reserve
     * 接口ID：415094003
     * 接口地址：https://app.apifox.com/link/project/7031354/apis/api-415094003
     */
    preInventoryReserve: builder.mutation<any, void>({
      query: () => ({
        url: `/api/v1/order/pre-inventory-reserve`,
        method: 'POST',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
      }),
      transformResponse: transformResponseHandler,
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
});

export const {
  useGetCheckoutInfoQuery,
  useLazyGetCheckoutInfoQuery,
  useUpdateCheckoutAddressMutation,
  useUpdateCheckoutShippingMethodMutation,
  useUpdateCheckoutAddressZipcodeMutation,
  useGenerateQuotationMutation,
  usePreInventoryReserveMutation,
  useGetOrderCheckoutDetailQuery,
} = checkoutSessionApi;
export const {
  getCheckoutInfo,
  updateCheckoutAddress,
  updateCheckoutShippingMethod,
  updateCheckoutAddressZipcode,
  generateQuotation,
  getOrderCheckoutDetail,
  preInventoryReserve,
} = checkoutSessionApi.endpoints;
