import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ProductOption } from '../entity/product.entity';

interface ProductCompleteListType {
  searchWord?: string;
  searchResult: ProductOption[];
}

const initialStateProductCompleteList: ProductCompleteListType = {
  searchWord: '',
  searchResult: [],
};

export const productCompleteListSlice = createSliceWithThunks({
  name: 'ProductCompleteList',
  initialState: initialStateProductCompleteList,
  reducers: (create) => {
    return {
      handleSearchWordChange: create.reducer((state, { payload }: PayloadAction<{ name: string }>) => {
        state.searchWord = payload.name;
      }),
      setSearchList: create.reducer((state, { payload }: PayloadAction<{ list: ProductOption[] }>) => {
        state.searchResult = payload.list;
      }),
    };
  },
  // extraReducers: (builder) => {
  // 	builder.addMatcher(handleSearchWordChange.fulfilled, (state, { payload }) => {
  // 		state.searchWord = payload;
  // 	});
  // },
  selectors: {
    currentSearchList: (state) => state.searchResult,
    currentSearchName: (state) => state.searchWord,
  },
});

export const { handleSearchWordChange, setSearchList } = productCompleteListSlice.actions;

export const { currentSearchList, currentSearchName } = productCompleteListSlice.selectors;
