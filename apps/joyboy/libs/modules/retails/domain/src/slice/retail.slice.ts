import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { Retail } from '../entity/retail.entity';
import { getRetailById, getRetails } from '../api/retails.api';

// reducer
type RetailState = {
  retail?: Retail;
  retailId: string;
  retails?: Retail[];
};
const initialStateRetailState: RetailState = {
  retailId: '',
};

export const retailSlice = createSliceWithThunks({
  name: 'retail',
  initialState: initialStateRetailState as RetailState,
  reducers: (create) => {
    return {
      setRetail: create.asyncThunk(async (retail: Retail) => {
        return retail;
      }),
    };
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(getRetails.matchFulfilled, (state, action) => {
        state.retails = action.payload;
      })
      .addMatcher(getRetailById.matchFulfilled, (state, action) => {
        state.retail = action.payload;
      });
  },
  selectors: {
    selectedRetailId: (state) => state.retail?.id,
    selectedCurrentRetail: (state) => state.retail,
    selectedRetails: (state) => state.retails,
  },
});

export const { setRetail } = retailSlice.actions;
export const { selectedCurrentRetail, selectedRetailId, selectedRetails } = retailSlice.selectors;
export default retailSlice.reducer;
