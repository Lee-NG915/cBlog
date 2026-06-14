import type { FreeGiftPromotionType } from '../entity/gift.entity';
import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, AsyncThunk } from '@reduxjs/toolkit';
import { batchRetrieveGiftsByVariantIds, getGiftsByCouponCode } from '../api/promotion.api.v1';
import { GiftVariantDetailSchema, GiftPoolSchema } from '@castlery/types';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export interface PromotionState {
  loadingStatusV2: boolean;
  freeGiftsPromotionV2: FreeGiftPromotionType[];
  freeGiftsLoadingV2: boolean;
  addFreeGiftLoadingV2: boolean;
  giftsVariantList: GiftVariantDetailSchema[];
  couponGifts: GiftPoolSchema[];
}

const initialState: PromotionState = {
  loadingStatusV2: false,
  freeGiftsPromotionV2: [],
  freeGiftsLoadingV2: false,
  addFreeGiftLoadingV2: false,
  giftsVariantList: [],
  couponGifts: [],
};

export const promotionSlice = createSliceWithThunks({
  name: 'promotion',
  initialState,
  reducers: (create) => ({
    setFreeGiftsPromotionsV2: create.reducer((state, { payload }: PayloadAction<FreeGiftPromotionType[]>) => {
      state.freeGiftsPromotionV2 = payload;
    }),
    clearCouponGifts: create.reducer((state) => {
      state.couponGifts = [];
    }),
  }),
  extraReducers(builder) {
    builder
      .addMatcher(
        (action): action is PendingAction => {
          const isFreeGiftsApi = action.meta?.arg?.endpointName === 'getGiftsByOrderNumberV2';
          return isFreeGiftsApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.freeGiftsLoadingV2 = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isFreeGiftsApi = action.meta?.arg?.endpointName === 'getGiftsByOrderNumberV2';
          return isFreeGiftsApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.freeGiftsLoadingV2 = false;
        }
      )
      .addMatcher(
        (action): action is PendingAction => {
          const isAddFreeGiftApi = action.meta?.arg?.endpointName === 'addGiftsByOrderNumberV2';
          return isAddFreeGiftApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.addFreeGiftLoadingV2 = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isAddFreeGiftApi = action.meta?.arg?.endpointName === 'addGiftsByOrderNumberV2';
          return isAddFreeGiftApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.addFreeGiftLoadingV2 = false;
        }
      )
      .addMatcher(
        (action) => batchRetrieveGiftsByVariantIds.matchFulfilled(action),
        (state, action) => {
          state.giftsVariantList = action.payload as GiftVariantDetailSchema[];
        }
      )
      .addMatcher(
        (action) => getGiftsByCouponCode.matchFulfilled(action),
        (state, action) => {
          const payload = action.payload as { giftPools: GiftPoolSchema[] };
          state.couponGifts = payload.giftPools || [];
        }
      );
  },
  selectors: {
    selectFreeGiftsV2: (state) => state.freeGiftsPromotionV2,
    selectFreeGiftsLoadingV2: (state) => state.freeGiftsLoadingV2,
    selectAddFreeGiftLoadingV2: (state) => state.addFreeGiftLoadingV2,
    selectGiftsVariantList: (state) => state.giftsVariantList || [],
    selectCouponGifts: (state) => state.couponGifts || [],
  },
});

export const { setFreeGiftsPromotionsV2, clearCouponGifts } = promotionSlice.actions;
export const {
  selectFreeGiftsV2,
  selectFreeGiftsLoadingV2,
  selectAddFreeGiftLoadingV2,
  selectGiftsVariantList,
  selectCouponGifts,
} = promotionSlice.selectors;
