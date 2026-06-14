import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ProductSearchResult } from '../entity/product.entity';

const initialStateProductList: ProductSearchResult = {
  hits: {
    hits: [],
    total: {
      relation: 'eq',
      value: 0,
    },
    max_score: null,
  },
  took: 0,
  timed_out: false,
  errorTips: '',
};

export const productListSlice = createSliceWithThunks({
  name: 'ProductList',
  initialState: initialStateProductList,
  reducers: (create) => {
    return {
      setProductList: create.reducer((state, { payload }: PayloadAction<ProductSearchResult>) => {
        if (payload.hits.hits.length === 0) {
          state.errorTips =
            'We couldn’t find any results that matched your criteria, but tweaking your search may help.';
        } else {
          state.errorTips = '';
        }
        state.hits.hits = payload.hits.hits;
      }),
      clearProductList: create.reducer((state) => {
        state.hits.hits = [];
      }),
    };
  },
  selectors: {
    currentProductList: (state) => state.hits.hits,
    currentProductListTips: (state) => state.errorTips,
  },
});

export const productListReducer = productListSlice.reducer;

export const { setProductList, clearProductList } = productListSlice.actions;

export const { currentProductList, currentProductListTips } = productListSlice.selectors;
