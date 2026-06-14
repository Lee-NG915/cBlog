/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiV1 } from '@castlery/shared-redux-services';
import type { CartItemsRoot_V2, LineItem_V2 } from '@castlery/types';
import { X_CART_TOKEN } from '@castlery/config';

const apiDefaultHeaders = { [X_CART_TOKEN]: 'true' };

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // Handle error
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const cartPosApi = apiV1.injectEndpoints({
  endpoints: (builder: any) => ({
    /**
     * Manual discount setting
     * @param lineItemId
     * @param discount
     * @returns
     */
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    manualSetDiscount: builder.mutation<
      void,
      { lineItemId: LineItem_V2['id']; adjustment: string; type: 'fixed_amount' | 'percentage' }
    >({
      query: ({
        lineItemId,
        adjustment,
        type,
      }: {
        lineItemId: LineItem_V2['id'];
        adjustment: string;
        type: 'fixed_amount' | 'percentage';
      }) => ({
        url: `/api/v1/pos/cart/manual-discount`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemId,
          adjustment,
          type,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * Overwrite service item price
     * @param payload
     * @returns
     */
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    overWriteServicePrice: builder.mutation<void, { lineItemId: LineItem_V2['id']; price: string }>({
      query: ({ lineItemId, price }: { lineItemId: LineItem_V2['id']; price: string }) => ({
        url: `/api/v1/pos/cart/overwrite_price`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemId,
          price,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * Add service items to cart: batch add
     * @param payload
     * @returns
     */
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    addServiceItemsToCart: builder.mutation<void, { serviceItems: {}[] }>({
      query: () => ({
        url: `/api/v1/pos/cart/service`,
        method: 'POST',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          // To be confirmed
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    clearPosCart: builder.mutation<void, void>({
      query: () => ({
        url: `/api/v1/pos/cart/clear`,
        method: 'DELETE',
        headers: {
          ...apiDefaultHeaders,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    transferCartItems: builder.mutation<
      void,
      {
        lineItemIdList: {
          lineItemId: LineItem_V2['id'];
          variantId: LineItem_V2['variant']['id'];
        }[];
        pushDestination: 'pos' | 'web';
      }
    >({
      query: (payload: any) => ({
        url: `/api/v1/pos/cart/transfer`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          ...payload,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // @ts-expect-error - Builder type inference issue with injectEndpoints
    getWebCartLineItems: builder.query<CartItemsRoot_V2, void>({
      query: () => ({
        url: '/api/v1/pos/cart/web-line-items',
        method: 'GET',
        headers: { ...apiDefaultHeaders },
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});
export const {
  useManualSetDiscountMutation,
  useAddServiceItemsToCartMutation,
  useOverWriteServicePriceMutation,
  useClearPosCartMutation,
  useGetWebCartLineItemsQuery,
} = cartPosApi;
export const {
  manualSetDiscount,
  addServiceItemsToCart,
  overWriteServicePrice,
  clearPosCart,
  transferCartItems,
  getWebCartLineItems,
} = cartPosApi.endpoints;
