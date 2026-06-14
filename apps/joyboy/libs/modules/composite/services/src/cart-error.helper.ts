import { isAnyOf } from '@reduxjs/toolkit';
import {
  addLineItemToCart,
  getCartSummary,
  removeCartItem,
  updateCartItemQty,
  mergeCart,
  addGiftToCart,
  getCartData,
  updateReloadCartLoading,
  updateZipcodeInCart,
  getWebCartLineItems,
  updateGiftInCart,
  refreshCart,
} from '@castlery/modules-cart-domain';
import { TransactionApiErrorCode, accessInPos, accessInWeb } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { AppDispatch } from '@castlery/shared-redux-store';
import { removeCouponFromCart, getGiftsByCouponCode } from '@castlery/modules-promotion-domain';

export const AddedItemsToCartSucceededEvent = addLineItemToCart.matchFulfilled;

export const UpdateZipcodeInCartFailedEvent = updateZipcodeInCart.matchRejected;

export const CartProcessFailedEvent = isAnyOf(
  getCartData.matchRejected,
  addLineItemToCart.matchRejected,
  getCartSummary.matchRejected,
  removeCartItem.matchRejected,
  updateCartItemQty.matchRejected,
  mergeCart.matchRejected,
  addGiftToCart.matchRejected,
  removeCouponFromCart.matchRejected,
  getWebCartLineItems.matchRejected,
  updateGiftInCart.matchRejected,
  getGiftsByCouponCode.matchRejected,
  refreshCart.matchRejected
);

export const needAutoReloadCartDataGroups = [
  TransactionApiErrorCode.ErrLessThanMinSaleQty, // 10701000
  TransactionApiErrorCode.ErrMoreThanMaxSaleQty, // 10701001
  TransactionApiErrorCode.ErrCouponInvalid, // 10701019
  TransactionApiErrorCode.ErrGiftInvalid, // 10701022
];

export const needIgnoredCartErrorCodes = [
  TransactionApiErrorCode.ErrLessThanMinSaleQty, //  10701000
  TransactionApiErrorCode.ErrUnequalQtyIncrements, //  10701002
];

export const showCustomizedItemConfirmationErrorCodes = [
  TransactionApiErrorCode.ErrCheckoutCustomizedItem, //  10702029
  TransactionApiErrorCode.ErrCheckoutMultipleItemsCustomizedItem, //  10702031
];

export const needRemoveCartTokenAndReloadPageErrorCodes = [
  TransactionApiErrorCode.ErrCartCacheExpired, //  10701042
  TransactionApiErrorCode.ErrLineItemsDeleted, //  10701043
];

export const handlersMap = {
  autoRefreshCart: () => {
    window.location.reload();
  },
  removeCartTokenAndReloadPage: () => {
    if (accessInWeb) {
      makePersistenceHandles().xCartToken.removeItem();
    }
    if (accessInPos) {
      makePersistenceHandles().xPosCartToken.removeItem();
    }
    window.location.reload();
  },
  reloadCartData: async (dispatch: AppDispatch) => {
    dispatch(updateReloadCartLoading(true));
    await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
    dispatch(updateReloadCartLoading(false));
  },
};
