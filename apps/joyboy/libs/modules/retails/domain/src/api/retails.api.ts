import { EcEnv } from '@castlery/config';
import type { Retail, StockLocation } from '../entity/retail.entity';
import { api } from '@castlery/shared-redux-services';

export const retailsApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getRetailById: builder.query<Retail, string | number>({
        query: (id) => ({
          url: `retails/${id}`,
          method: 'GET',
        }),
      }),
      getRetails: builder.query<[Retail], void>({
        query: () => ({
          url: `retails`,
          method: 'GET',
        }),
      }),

      getStockLocationsByRetailId: builder.query<[StockLocation], number>({
        query: (id) => ({
          url: `retails/${id}/stock_locations`,
          method: 'GET',
        }),
        transformResponse(baseQueryReturnValue: StockLocation[]): StockLocation[] {
          return [
            {
              id: '',
              name: 'Warehouse',
              location_type: 'warehouse',
            },
            ...baseQueryReturnValue.map((item) => ({
              ...item,
              id: item.id + '',
            })),
          ];
        },
      }),
      // TODO 思考下你能不能在这里简单的组合 该 domain 下 的 state 做成一个组合式的api
      // getCurrentRetail: builder.query<Retail, void>({
      //   query: () => ({
      //     url: `retails/current`,
      //     method: 'GET',
      //   }),
      // }),
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRetailsQuery, useGetRetailByIdQuery, useGetStockLocationsByRetailIdQuery } = retailsApi;
export const { getRetails, getRetailById, getStockLocationsByRetailId } = retailsApi.endpoints;
