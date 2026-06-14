import { initWishList } from '../slice/wishlist.slice';
import { isAnyOf } from '@reduxjs/toolkit';
import { addTheLookWishlist, addWishlist, deleteTheLookWishlist, deleteWishlist } from '../api/wishlist.api';
export const InitWishListEvent = initWishList.fulfilled;
export const TheLookWishListEvent = isAnyOf(addTheLookWishlist.matchFulfilled, deleteTheLookWishlist.matchFulfilled);

export const addWishlistEvent = addWishlist.matchFulfilled;
export const removeWishlistEvent = deleteWishlist.matchFulfilled;
