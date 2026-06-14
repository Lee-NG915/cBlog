import type { ProductSearchResult } from '../entity/product.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { api, searchApi } from '@castlery/shared-redux-services';

export const plpSearchApi = searchApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getPlpListSearch: builder.query<ProductSearchResult, { name: string; zipCode?: string }>({
        query: ({ name, zipCode }) => ({
          url: '/product/_search',
          method: 'POST',
          headers: {
            'X-Location-Zipcode': zipCode,
          },
          body: {
            query: {
              simple_query_string: {
                fields: ['name'],
                query: name,
              },
            },
            size: 24,
            sort: [
              {
                _score: 'desc',
                rank: 'asc',
              },
            ],
          },
        }),
      }),
      getStoryblokProductList: builder.query<ProductSearchResult, { productId: string[] | string }>({
        query: ({ productId }) => ({
          url: '/product/_search',
          method: 'POST',
          body: {
            query: {
              bool: {
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
              must: {
                ids: {
                  values: [...(Array.isArray(productId) ? productId : [productId])],
                },
              },
            },
          },
        }),
      }),
    };
  },
});

export const { useGetPlpListSearchQuery, useLazyGetPlpListSearchQuery } = plpSearchApi;
export const { getPlpListSearch, getStoryblokProductList } = plpSearchApi.endpoints;
