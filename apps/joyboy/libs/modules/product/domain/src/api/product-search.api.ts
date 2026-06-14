import type { ProductOption } from '../entity/product.entity';
import { searchApi } from '@castlery/shared-redux-services';
import { getProductBySKU } from './product.api';
import { setAutoCompleteList } from '../slice/auto-complete-list.slice';
import { POS_CHANNEL, WEB_CHANNEL, X_CHANNEL } from '@castlery/config';

export const productSearchApi = searchApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getProductOptions: builder.query<[ProductOption], string>({
        query: (query) => ({
          url: `product/autocomplete?q=${encodeURIComponent(
            query
          )}&category_max_cnt=0&collection_max_cnt=0&variant_max_cnt=6`,
          headers: {
            [X_CHANNEL]: POS_CHANNEL,
          },
        }),
        async onQueryStarted(query, { dispatch, queryFulfilled }) {
          const getPDPProduct = await dispatch(getProductBySKU.initiate(query));
          const result = await queryFulfilled;
          const pdpList = [];
          if (getPDPProduct?.data) {
            const { data } = getPDPProduct;
            pdpList.push({
              type: 'product',
              slug: data.slug,
              name: getPDPProduct.data.name,
              image: getPDPProduct.data.variants[0].images[0].links.large,
            });
          }
          const autoCompleteList = result.data.filter((item) => item.type === 'product');
          dispatch(
            setAutoCompleteList({
              list: pdpList.concat(autoCompleteList || []),
              name: query,
            })
          );
        },
      }),
      getSearchResult: builder.query<ProductOption[], string>({
        query: (query) => ({
          url: `product/autocomplete?q=${encodeURIComponent(query)}`,
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
        }),
      }),
    };
  },
});

export const { useGetProductOptionsQuery, useGetSearchResultQuery } = productSearchApi;
export const { getProductOptions, getSearchResult } = productSearchApi.endpoints;
