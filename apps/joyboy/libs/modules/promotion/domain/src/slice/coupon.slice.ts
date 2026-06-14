import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, EntityState, createEntityAdapter, createSelector, AsyncThunk } from '@reduxjs/toolkit';
import { CouponItemV2 } from '../entity/coupon.entity';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export const COUPON_FEATURE_KEY = 'coupon';

/**
 * couponAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */
export const couponAdapter = createEntityAdapter<CouponItemV2, string>({
  // 直接使用code作为唯一ID，因为code是不可重复的
  selectId: (coupon) => coupon.code,
});

export interface CouponState extends EntityState<CouponItemV2, string> {
  loadingStatusV2: boolean;
  couponsV2: CouponItemV2[];
  applyCouponLoadingV2: boolean;
  removeCouponLoadingV2: boolean;
}

export const initialCouponState: CouponState = couponAdapter.getInitialState<CouponState>({
  loadingStatusV2: false,
  couponsV2: [],
  applyCouponLoadingV2: false,
  removeCouponLoadingV2: false,
  ids: [],
  entities: {},
});

export const couponSlice = createSliceWithThunks({
  name: COUPON_FEATURE_KEY,
  initialState: initialCouponState,
  reducers: (create) => ({
    setCouponsV2: create.reducer((state, { payload }: PayloadAction<CouponItemV2[]>) => {
      state.couponsV2 = payload;
      couponAdapter.setAll(state, payload);
    }),
  }),

  extraReducers(builder) {
    builder
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetCouponsApi = action.meta?.arg?.endpointName === 'getCouponsByOrderNumberV2';
          return isGetCouponsApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.loadingStatusV2 = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetCouponsApi = action.meta?.arg?.endpointName === 'getCouponsByOrderNumberV2';
          return isGetCouponsApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.loadingStatusV2 = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return (
            action.meta?.arg?.endpointName === 'applyCouponV2' &&
            (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'))
          );
        },
        (state) => {
          state.applyCouponLoadingV2 = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return action.meta?.arg?.endpointName === 'applyCouponV2' && action.type.endsWith('/pending');
        },
        (state) => {
          state.applyCouponLoadingV2 = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return (
            action.meta?.arg?.endpointName === 'removeCouponV2' &&
            (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'))
          );
        },
        (state) => {
          state.removeCouponLoadingV2 = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return action.meta?.arg?.endpointName === 'removeCouponV2' && action.type.endsWith('/pending');
        },
        (state) => {
          state.removeCouponLoadingV2 = true;
        }
      )
      .addDefaultCase(() => {});
  },
  selectors: {
    selectCouponsV2: (state) => state.couponsV2,
    selectCouponLoadingV2: (state) => state.loadingStatusV2,
    selectApplyCouponLoadingV2: (state) => state.applyCouponLoadingV2,
    selectRemoveCouponLoadingV2: (state) => state.removeCouponLoadingV2,
  },
});

/*
 * Export reducer for store configuration.
 */
export const couponReducer = couponSlice.reducer;
export const { setCouponsV2 } = couponSlice.actions;

export const { selectCouponsV2, selectCouponLoadingV2, selectApplyCouponLoadingV2, selectRemoveCouponLoadingV2 } =
  couponSlice.selectors;

export const selectCouponProcessingV2 = createSelector(
  [selectApplyCouponLoadingV2, selectRemoveCouponLoadingV2],
  (applyCouponLoading, removeCouponLoading) => applyCouponLoading || removeCouponLoading
);
