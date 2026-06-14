import { api } from '@castlery/shared-redux-services';

// Define a service using a base URL and expected endpoints
export const orderHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerOrderHistory: builder.query<any, void>({
      query: () => ({
        url: `users/me/orders`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      },
    }),
    getOrderDetails: builder.query<any, { orderNumber: string }>({
      query: ({ orderNumber }) => ({
        url: `orders/${orderNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      },
    }),
  }),
});

export const { useGetCustomerOrderHistoryQuery, useGetOrderDetailsQuery } = orderHistoryApi;

export const { getCustomerOrderHistory, getOrderDetails } = orderHistoryApi.endpoints;
