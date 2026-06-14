import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { EntityState, createEntityAdapter } from '@reduxjs/toolkit';

export const CHECKOUT_FEATURE_KEY = 'dyRecommendations';

export const dyRecommendationsAdapter = createEntityAdapter<any>({});
export interface DyRecommendationsState extends EntityState<any> {
  cartRecProducts: any[];
}
export const initialDyRecommendationsState: DyRecommendationsState = dyRecommendationsAdapter.getInitialState({
  cartRecProducts: [],
});

export const dyRecommendationsSlice = createSliceWithThunks({
  name: CHECKOUT_FEATURE_KEY,
  initialState: initialDyRecommendationsState,
  reducers: (create) => ({
    setCartRecProducts: create.reducer((state, { payload }: { payload: any }) => {
      // TODO: @abbbywang23 add the filter logic here
      // state.cartRecProducts = payload;
      const data = payload.hitVariation.payload.data;
      // Filter out the SKUs under the same SPU based on group_id, and only keep one SKU.
      // The reason is that the products under the same SPU are similar, and do not want duplicate products to appear when recommending.
      const recProducts = data?.slots?.reduce((acc, slot) => {
        const groupId = slot.productData.group_id;
        if (!acc.find((item) => item.productData.group_id === groupId)) {
          return [...acc, slot];
        }
        return acc;
      }, []);
      // reset display length
      const dyRecProductsLength = data?.custom?.recommendationLength;
      let displayLength = 50; // default display length based on the Dy recommendation settings
      if (typeof Number(dyRecProductsLength) === 'number') {
        displayLength = dyRecProductsLength;
      }
      if (isNaN(displayLength)) {
        displayLength = recProducts?.length;
      }
      state.cartRecProducts = recProducts?.slice(0, displayLength) || [];
    }),
  }),
  extraReducers() {},
  selectors: {
    selectCartRecProducts: (state) => state.cartRecProducts,
  },
});

export const { setCartRecProducts } = dyRecommendationsSlice.actions;

export const { selectCartRecProducts } = dyRecommendationsSlice.selectors;
