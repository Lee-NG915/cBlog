import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import type { YotpoDetailRoot_V2, YotpoRedemPtionOption } from '../entity/yotpo.entity';
import { getYotpoRedemptionOptions, getYotpoCustomerDetails } from '../api/yotpo.api';
export const YOTPO_FEATURE_KEY = 'yotpo_credits';
/**
 * cartAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */
export const yotpoAdapter = createEntityAdapter<any>({});
export interface yotpoCreditsState extends EntityState<any, number> {
  yotpoDetails: YotpoDetailRoot_V2 | null;
  creditsRedemptionOptions: YotpoRedemPtionOption[];
}

export const initialYotpoCreditsState: yotpoCreditsState = yotpoAdapter.getInitialState({
  yotpoDetails: null,
  creditsRedemptionOptions: [],
});

export const yotpoSlice = createSliceWithThunks({
  name: YOTPO_FEATURE_KEY,
  initialState: initialYotpoCreditsState,
  reducers: (create) => ({
    setYotpoDetails: create.reducer((state, action: PayloadAction<YotpoDetailRoot_V2>) => {
      state.yotpoDetails = action.payload;
    }),
  }),
  selectors: {
    selectYotpoDetails: (state: yotpoCreditsState) => state.yotpoDetails,
    selectYotpoPoints: (state: yotpoCreditsState) => state.yotpoDetails?.points_balance || 0,
    selectYotpoRedemptionOptions: (state: yotpoCreditsState) => state.creditsRedemptionOptions || [],
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => getYotpoRedemptionOptions.matchFulfilled(action),
      (state, action) => {
        state.creditsRedemptionOptions = action.payload || [];
      }
    );
    builder.addMatcher(
      (action) => getYotpoCustomerDetails.matchFulfilled(action),
      (state, action) => {
        state.yotpoDetails = action.payload;
      }
    );
  },
});

export const { setYotpoDetails } = yotpoSlice.actions;
export const { selectYotpoDetails, selectYotpoPoints, selectYotpoRedemptionOptions } = yotpoSlice.selectors;
