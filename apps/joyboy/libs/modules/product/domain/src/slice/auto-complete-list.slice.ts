import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ProductOption } from '../entity/product.entity';

interface ProductOptionsMap {
  [key: string]: ProductOption[];
}

const initialStateAutoCompleteList: ProductOptionsMap = {
  '': [],
};

export const autoCompleteListSlice = createSliceWithThunks({
  name: 'AutoCompleteList',
  initialState: initialStateAutoCompleteList,
  reducers: (create) => {
    return {
      setAutoCompleteList: create.reducer(
        (state, { payload }: PayloadAction<{ name: string; list: ProductOption[] }>) => {
          state[payload.name] = payload.list;
        }
      ),
    };
  },
  selectors: {
    currentAutoCompleteList: (state) => state,
  },
});

export const autoCompleteListReducer = autoCompleteListSlice.reducer;

export const { setAutoCompleteList } = autoCompleteListSlice.actions;

export const { currentAutoCompleteList } = autoCompleteListSlice.selectors;
