import { EcEnv, WEB_CHANNEL } from '@castlery/config';
import { addWishlistEvent, removeWishlistEvent, removeWishListItem, wishListPush } from '@castlery/modules-user-domain';
import { AppStartListening, RootState } from '@castlery/shared-redux-store';
import { isAnyOf, Unsubscribe } from '@reduxjs/toolkit';
import { WishListItem } from '@castlery/modules-user-domain';

export function setupWishlistListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase() === WEB_CHANNEL && [
      startListening({
        matcher: isAnyOf(addWishlistEvent),
        effect: async (action, { dispatch, getState }) => {
          const rootState = getState() as RootState;
          const wishList = rootState?.wishlist?.wishList;
          const checkIndex = wishList?.findIndex((item) => item?.id === (action['payload'] as any)?.id);
          if (checkIndex === -1) {
            dispatch(wishListPush(action['payload'] as WishListItem));
          }
        },
      }),
      startListening({
        matcher: isAnyOf(removeWishlistEvent),
        effect: async (action, { dispatch, getState }) => {
          const originalArgs = (action['meta'] as any)?.arg?.originalArgs;
          if (originalArgs) {
            const variantId = +originalArgs;
            dispatch(removeWishListItem(variantId));
          }
        },
      }),
    ]) ||
      []),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
