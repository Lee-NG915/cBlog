import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialStateShopTheLook: {
  shopTheLooVariantData: any[];
} = {
  shopTheLooVariantData: [],
};

export const shopTheLookSlice = createSliceWithThunks({
  name: 'shopTheLookInfo',
  initialState: initialStateShopTheLook,
  reducers: (create) => {
    return {
      setShopTheLookVariantData: create.reducer((state, { payload }: PayloadAction<any[]>) => {
        state.shopTheLooVariantData = payload;
      }),
    };
  },
  selectors: {
    selectShopTheLookVariantData: (state) => state.shopTheLooVariantData,
  },
});

export const shopTheLookReducer = shopTheLookSlice.reducer;
export const { setShopTheLookVariantData } = shopTheLookSlice.actions;
export const { selectShopTheLookVariantData } = shopTheLookSlice.selectors;
