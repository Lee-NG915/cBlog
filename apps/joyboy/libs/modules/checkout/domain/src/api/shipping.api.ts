import { api, tagTypes } from '@castlery/shared-redux-services';
import type { AdditionalShippingService, AddServiceProductPayload } from '../entity/service.entity';
import type {
  ChangeAddressRequestPayload,
  SearchAddressResult,
  AddAddressRequestPayload,
  AddressEntity,
} from '../entity/address.entity';
import { type Order } from '@castlery/types';
import { ecPosFeatures } from '@castlery/config';

export const shippingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * choose services
     */
    getAvailableShipmentServices: builder.query<AdditionalShippingService[], string>({
      // query: (number) => ({
      //   url: `orders/${number}/shipment_services`,
      //   method: 'GET',
      // }),
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        if (!ecPosFeatures.enabledAdditionalServices || !arg) {
          return { data: [] };
        }
        const result = await baseQuery({
          url: `orders/${arg}/shipment_services`,
          method: 'GET',
        });
        return result;
      },
    }),
    searchAddress: builder.query<SearchAddressResult[], { query: string }>({
      query: ({ query }) => ({
        url: `https://search-test.castlery.sg/addresses?q=${query}`,
        method: 'GET',
      }),
    }),
    addAddress: builder.mutation<AddressEntity[], AddAddressRequestPayload & { number: string }>({
      query: ({ number, ...rest }) => ({
        url: `users/${number}/address`, //https://pos-test.castlery.sg/api/users/177432/addresses
        method: 'POST',
        body: {
          ...rest,
        },
      }),
    }),
    changeAddressByOrderNumber: builder.mutation<Order, Partial<ChangeAddressRequestPayload> & { number: string }>({
      query: ({ number, ...rest }) => ({
        url: `checkouts/${number}/address`,
        method: 'PUT',
        body: {
          ...rest,
        },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    confirmDelivery: builder.mutation<Order, { number: string }>({
      query: ({ number }) => ({
        url: `checkouts/${number}/delivery`,
        method: 'PUT',
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    addServiceProduct: builder.mutation<Order, AddServiceProductPayload>({
      query: ({ number, ...rest }) => ({
        url: `checkouts/${number}/shipment_service`, //checkouts/R323776482/shipment_service
        method: 'POST',
        body: { ...rest },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    changeDeliveryDate: builder.mutation<Order, { number: string; shipmentId: number; deliveryDate: string }>({
      query: ({ number, shipmentId, deliveryDate }) => ({
        url: `checkouts/${number}/delivery_option`,
        method: 'PUT',
        body: {
          shipments_attributes: {
            id: shipmentId,
            preferred_delivery_date: deliveryDate,
          },
        },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    changeDeliveryOption: builder.mutation<Order, { number: string; mode: 'lead_time' | 'all_together' }>({
      query: ({ number, mode }) => ({
        url: `checkouts/${number}/delivery_option`,
        method: 'PUT',
        body: {
          mode: mode,
        },
      }),
    }),
    getShipmentOptions: builder.query<any, { number: string }>({
      query: ({ number }) => ({
        url: `orders/${number}/shipment_options`,
      }),
    }),
    changeServiceType: builder.mutation<
      Order,
      { number: string; shipmentId: number; serviceType: string; waiveFee: boolean }
    >({
      query: ({ number, shipmentId, serviceType, waiveFee }) => ({
        url: `checkouts/${number}/shipments_service_type`,
        method: 'PUT',
        body: {
          shipment_service_types: [
            {
              shipment_id: shipmentId,
              service_type: serviceType,
              waive_service_fee: waiveFee,
            },
          ],
        },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
  }),
});
export const {
  useGetAvailableShipmentServicesQuery,
  useSearchAddressQuery,
  useAddAddressMutation,
  useAddServiceProductMutation,
  useChangeDeliveryDateMutation,
  useConfirmDeliveryMutation,
  useGetShipmentOptionsQuery,
} = shippingApi;
export const {
  getAvailableShipmentServices,
  searchAddress,
  addAddress,
  changeAddressByOrderNumber,
  confirmDelivery,
  addServiceProduct,
  changeDeliveryDate,
  changeDeliveryOption,
  getShipmentOptions,
  changeServiceType,
} = shippingApi.endpoints;
