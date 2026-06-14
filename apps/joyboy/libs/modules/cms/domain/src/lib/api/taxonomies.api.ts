import { api } from '@castlery/shared-redux-services';

export const taxonomiesApi = api.injectEndpoints({
  endpoints(builder) {
    return {
      getTaxonomiesMenu: builder.query({
        query: () => 'taxonomies/menu',
      }),
      getTaxonomiesCollections: builder.query({
        query: () => 'taxonomies/collections',
      }),
    };
  },
});

export const { useGetTaxonomiesCollectionsQuery, useGetTaxonomiesMenuQuery } = taxonomiesApi;

export const { getTaxonomiesCollections, getTaxonomiesMenu } = taxonomiesApi.endpoints;
