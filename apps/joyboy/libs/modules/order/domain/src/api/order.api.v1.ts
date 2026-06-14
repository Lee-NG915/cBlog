// eslint-disable-next-line @nx/enforce-module-boundaries
import { apiV1 } from '@castlery/shared-redux-services';
import { accessInPos, X_CHECKOUT_TOKEN } from '@castlery/config';
import { PosCreateOrderResponseData, OrderDataV1 } from '@castlery/types';
// import { tagTypes } from '@castlery/shared-redux-services';

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const orderApiV1 = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    createTransactionOrder: builder.mutation<
      PosCreateOrderResponseData,
      {
        exchangeOrderNumber?: string;
        orderComment?: string;
        tradePartnerId?: string;
      }
    >({
      query: (params) => ({
        url: accessInPos ? '/api/v1/pos/order' : '/api/v1/order/create',
        method: 'POST',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: params,
      }),
      extraOptions: {
        maxRetries: 0,
      },
      transformResponse: transformResponseHandler,
    }),
    getTransactionOrderDetailById: builder.query<OrderDataV1, string | { id: string; token?: string }>({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const token = typeof arg === 'string' ? undefined : arg.token;
        return {
          url: accessInPos ? `/api/v1/pos/order/detail` : `/api/v1/order/detail`,
          method: 'GET',
          params: {
            id,
            ...(token ? { token } : {}),
          },
        };
      },
      transformResponse: transformResponseHandler,
    }),
    getTransactionOrderPayments: builder.query<any, string>({
      query: (orderId) => ({
        url: accessInPos ? `/api/v1/pos/order/payments` : `/api/v1/order/payments`,
        method: 'GET',
        params: {
          orderId: orderId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    updatePosOrderDetail: builder.mutation<
      void,
      {
        exchangeOrderNumber?: string;
        orderComment?: string;
        tradePartnerId?: string;
        orderId: string;
      }
    >({
      query: (params) => ({
        url: `/api/v1/pos/order/base`,
        method: 'PUT',
        body: params,
      }),
      extraOptions: {
        maxRetries: 0,
      },
      transformResponse: transformResponseHandler,
    }),
    updateTransactionOrderAddress: builder.mutation<
      void,
      {
        addressId: number;
        id: string; //orderId
        type: 'shipping' | 'billing';
      }
    >({
      query: (payload) => ({
        url: accessInPos ? `/api/v1/pos/order/address` : `/api/v1/order/address`,
        method: 'PUT',
        body: payload,
      }),
      extraOptions: {
        maxRetries: 0,
      },
      transformResponse: transformResponseHandler,
    }),
    recheckInventoryReserve: builder.mutation<
      { stripePaymentLink: string; alreadyPaid: boolean },
      { id: string; token: string }
    >({
      query: ({ id, token }) => ({
        url: `/api/v1/order/recheck-inventory-reserve`,
        method: 'POST',
        body: { id, token },
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});

export const {
  useCreateTransactionOrderMutation,
  useGetTransactionOrderDetailByIdQuery,
  useLazyGetTransactionOrderDetailByIdQuery,
  useGetTransactionOrderPaymentsQuery,
  useLazyGetTransactionOrderPaymentsQuery,
  useUpdateTransactionOrderAddressMutation,
  useRecheckInventoryReserveMutation,
} = orderApiV1;

export const {
  createTransactionOrder,
  getTransactionOrderDetailById,
  getTransactionOrderPayments,
  updatePosOrderDetail,
  updateTransactionOrderAddress,
  recheckInventoryReserve,
} = orderApiV1.endpoints;
