import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction } from '@reduxjs/toolkit';
import { TheLookWishListItem, WishListItem } from '../entity/wishList.entity';

type WishListState = {
  wishList: WishListItem[];
  theLookWishList: TheLookWishListItem[];
  wishlistActionRecord: 'init' | 'add' | 'remove';
  tempRemoveWishListItemInfo: {
    name?: string;
    id?: number;
  };
};

export const wishlistSlice = createSliceWithThunks({
  name: 'wishlist',
  initialState: {
    wishList: [],
    theLookWishList: [],
    wishlistActionRecord: 'init',
    tempRemoveWishListItemInfo: {},
  } as WishListState,
  reducers: (create) => {
    return {
      initWishList: create.asyncThunk(() => {
        return null;
      }),
      setWishList: create.reducer((state, { payload }: PayloadAction<WishListItem[]>) => {
        state.wishList = payload;
      }),
      setTheLookWishList: create.reducer((state, { payload }: PayloadAction<TheLookWishListItem[]>) => {
        state.theLookWishList = payload;
      }),
      wishListPush: create.reducer((state, { payload }: PayloadAction<WishListItem>) => {
        state.wishList.push(payload);
      }),
      theLookWishListPush: create.reducer((state, { payload }: PayloadAction<TheLookWishListItem>) => {
        state.theLookWishList.push(payload);
      }),
      removeWishListItem: create.reducer((state, { payload }: PayloadAction<number>) => {
        state.wishlistActionRecord = 'remove';
        state.wishList = state.wishList.filter((item) => item.id !== payload);
      }),
      removeTheLookWishListItem: create.reducer((state, { payload }: PayloadAction<number>) => {
        state.theLookWishList = state.theLookWishList.filter((item) => item.id !== payload);
      }),
      updateWishlistActionRecord: create.reducer((state, { payload }: PayloadAction<'init' | 'add' | 'remove'>) => {
        state.wishlistActionRecord = payload;
      }),
      updateTempRemoveWishListItemInfo: create.reducer(
        (state, { payload }: PayloadAction<{ name?: string; id?: number }>) => {
          state.tempRemoveWishListItemInfo = payload;
        }
      ),
    };
  },
  selectors: {
    selectedWishList: (sliceState) => sliceState.wishList,
    selectedTheLookWishList: (sliceState) => sliceState.theLookWishList,
    selectedWishlistActionRecord: (sliceState) => sliceState.wishlistActionRecord,
    selectedTempRemoveWishListItemInfo: (sliceState) => sliceState.tempRemoveWishListItemInfo,
  },
});

export const {
  setWishList,
  setTheLookWishList,
  initWishList,
  wishListPush,
  theLookWishListPush,
  removeWishListItem,
  removeTheLookWishListItem,
  updateWishlistActionRecord,
  updateTempRemoveWishListItemInfo,
} = wishlistSlice.actions;

export const {
  selectedWishList,
  selectedTheLookWishList,
  selectedWishlistActionRecord,
  selectedTempRemoveWishListItemInfo,
} = wishlistSlice.selectors;
