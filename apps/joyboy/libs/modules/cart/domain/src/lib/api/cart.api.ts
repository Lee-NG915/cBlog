import { apiV1 } from '@castlery/shared-redux-services';
import type {
  CartSummarySchema_V2,
  LineItem_V2,
  SearchZipcodeRoot_V2,
  Zipcode_V2,
  CartDataSchema,
} from '@castlery/types';
import { X_CART_TOKEN, enabledSearchZipcodeForShippingByGoogle, accessInPos } from '@castlery/config';

const apiDefaultHeaders = { [X_CART_TOKEN]: 'true' };

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const cartApi = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 刷新X-CartToken
     * 购物车在用户未登录时,使用X-CartToken来保留临时数据，存储生效时间180d
     * 用户已登录时，传空字符串
     */
    refreshCartToken: builder.query<{ token: string }, void>({
      query: () => ({
        url: accessInPos ? '/api/v1/pos/cart/token' : '/api/v1/cart/token',
        method: 'GET',
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 获取购物车商品数量
     */
    getCartItemsCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: '/api/v1/cart/count',
        method: 'GET',
        headers: {
          ...apiDefaultHeaders,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // 获取购物车数据
    // 在server端，cartToken是必填的，在客户端，cartToken是可选的
    getCartData: builder.query<CartDataSchema, HeadersInit | void>({
      query: (headers) => ({
        url: accessInPos ? '/api/v1/pos/cart/line-items' : 'api/v1/cart/line-items',
        method: 'GET',
        headers: { ...apiDefaultHeaders, ...(typeof headers === 'object' ? headers : {}) },
      }),
      transformResponse: transformResponseHandler,
    }),

    /**
     * 获取购物车汇总信息
     */
    getCartSummary: builder.query<CartSummarySchema_V2, { summaryCacheId: string; headers?: HeadersInit }>({
      query: ({ summaryCacheId, headers }) => ({
        url: '/api/v1/cart/summary',
        method: 'GET',
        headers: {
          ...apiDefaultHeaders,
          ...(typeof headers === 'object' ? headers : {}),
        },
        params: {
          id: summaryCacheId || 0, // 0: 强制从数据库获取
        },
      }),
      extraOptions: {
        maxRetries: 3,
      },
      transformResponse: transformResponseHandler,
    }),
    /**
     * 刷新购物车
     */
    refreshCart: builder.mutation<void, { cartItemId: LineItem_V2['id']; variantId: LineItem_V2['variant']['id'] }[]>({
      query: (cartItemIdList) => ({
        url: accessInPos ? '/api/v1/pos/cart/refresh' : 'api/v1/cart/refresh',
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          cartItemId: cartItemIdList,
        },
      }),
      transformResponse: transformResponseHandler,
    }),

    /**
     * 更新购物车邮编
     */
    updateZipcodeInCart: builder.mutation<void, Zipcode_V2>({
      query: ({ zipcode, countryState, city }) => ({
        url: accessInPos ? '/api/v1/pos/cart/zipcode' : '/api/v1/cart/zipcode',
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          zipcode, // just for test
          countryState,
          city,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 搜索邮编
     * //统一使用Google place查询 @todos： abbywang23
     */
    searchZipcodeForShipping: builder.query<SearchZipcodeRoot_V2[], string>({
      query: (zipcode) => {
        const queryParams = enabledSearchZipcodeForShippingByGoogle
          ? {
              url: `/cities?q=${zipcode}&size=100`,
              method: 'GET',
            }
          : {
              url: `/shipping_configurations/${zipcode}`,
              method: 'GET',
            };

        return queryParams;
      },
      transformResponse: (response: any) => {
        //  au response is array
        return enabledSearchZipcodeForShippingByGoogle
          ? response
          : [
              {
                city: response.city,
                state: response.state_abbr,
                zipcode: response.zip,
              },
            ];
      },
      extraOptions: {
        maxRetries: 0,
      },
    }),
    /**
     * 合并购物车： 未登录购物车合并到已登录购物车
     */
    mergeCart: builder.mutation<
      {
        createLineResults: {
          variantId: LineItem_V2['variant']['id'];
          code: number; // 错误码
        }[];
      },
      void
    >({
      query: () => ({
        url: accessInPos ? '/api/v1/pos/cart/merge' : '/api/v1/cart/merge',
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    initCheckout: builder.mutation<
      { token: string },
      { lineItemIds: LineItem_V2['id'][]; needsShippingMethod?: boolean /** true:need shipping method */ }
    >({
      query: ({ lineItemIds, needsShippingMethod = false }) => ({
        url: accessInPos ? '/api/v1/pos/checkout/init' : '/api/v1/checkout/init',
        method: 'POST',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemIds,
          ...(needsShippingMethod ? { needsShippingMethod: true } : {}),
        },
      }),
      transformResponse: (response: any) => {
        if (response.code !== 0) {
          // 处理错误
          const errorMsg = JSON.stringify(response);
          throw new Error(errorMsg);
        }
        if (response.data.validationError && response.data.validationError.errorCode !== 0) {
          const errorMsg = JSON.stringify(response.data.validationError);
          throw new Error(errorMsg);
        }
        return response.data;
      },
    }),
  }),
});
export const {
  useRefreshCartMutation,
  useGetCartSummaryQuery,
  useSearchZipcodeForShippingQuery,
  useUpdateZipcodeInCartMutation,
  useRefreshCartTokenQuery,
  useGetCartItemsCountQuery,
  useLazySearchZipcodeForShippingQuery,
  useMergeCartMutation,
  useInitCheckoutMutation,
} = cartApi;
export const {
  refreshCartToken,
  getCartItemsCount,
  refreshCart,
  getCartSummary,
  searchZipcodeForShipping,
  updateZipcodeInCart,
  mergeCart,
  initCheckout,
  getCartData,
} = cartApi.endpoints;
