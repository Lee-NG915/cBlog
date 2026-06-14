import { api } from '@castlery/shared-redux-services';
import type { VoucherResponse } from '../entity/voucher.entity';

// Define a service using a base URL and expected endpoints
export const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @description get shipment services by order number
     * @param {string} orderNumber
     * @returns {ServiceResponse}
     */
    getVouchers: builder.query<VoucherResponse, void>({
      query: () => `/api/v1/promotion/vouchers`,
    }),
    getVouchersV1: builder.query<VoucherResponse, void>({
      query: () => `/users/me/vouchers`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = OrderApi;
export const { useGetVouchersQuery, useGetVouchersV1Query } = serviceApi;

// export endpoints for use in SSR
export const { getVouchers, getVouchersV1 } = serviceApi.endpoints;
