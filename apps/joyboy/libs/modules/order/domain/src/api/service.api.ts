import { api } from '@castlery/shared-redux-services';
import type { ServiceResponse, AddonServiceType } from '../entity/service.entity';

// Define a service using a base URL and expected endpoints
export const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddonServices: builder.query<AddonServiceType[], void>({
      query: () => `/addon_services`,
    }),
    /**
     * @description get shipment services by order number
     * @param {string} orderNumber
     * @returns {ServiceResponse}
     */
    getShipmentServices: builder.query<ServiceResponse, string>({
      query: (orderNumber) => `orders/${orderNumber}/shipment_services`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = OrderApi;
export const { useGetShipmentServicesQuery, useGetAddonServicesQuery } = serviceApi;

// export endpoints for use in SSR
export const { getShipmentServices, getAddonServices } = serviceApi.endpoints;
