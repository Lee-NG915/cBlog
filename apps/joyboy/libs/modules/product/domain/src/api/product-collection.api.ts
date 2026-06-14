import type { ProductSearchResult } from '../entity/product.entity';
import { api } from '@castlery/shared-redux-services';

export const productCollectionApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getProductCollections: builder.query<ProductSearchResult, { collections: number[] }>({
        query: ({ collections }) => ({
          url: '/product/_search',
          method: 'POST',
          body: {
            query: {
              bool: {
                must: {
                  ids: {
                    values: collections,
                  },
                },
                filter: {
                  nested: {
                    path: 'variants',
                    query: {
                      bool: {
                        filter: {
                          exists: {
                            field: 'variants',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            size: 32,
          },
        }),
      }),
    };
  },
});

export const { useGetProductCollectionsQuery, useLazyGetProductCollectionsQuery } = productCollectionApi;
export const { getProductCollections } = productCollectionApi.endpoints;
