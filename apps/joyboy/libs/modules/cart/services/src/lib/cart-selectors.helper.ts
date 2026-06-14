import { selectedCustomerId } from '@castlery/modules-user-domain';
import { createSelector } from '@reduxjs/toolkit';
import { selectCartLineItems, selectLineItemsAndServiceLineItems } from '@castlery/modules-cart-domain';

/**
 * Only for Pos
 * Check the push to online button status
 */
export const selectPushToOnlineBtnStatus = createSelector(
  [selectCartLineItems, selectedCustomerId],
  (cartItems, customerId) => {
    const res = {
      disabled: true,
      loading: false,
    };
    if (cartItems && customerId) {
      res.disabled = cartItems.length <= 0 || cartItems.some((item) => item.isPriceOutdated || item.isRegionOutdated);
    }
    return res;
  }
);

/**
 * @description:  POS 结算按钮状态， 用于判断是否可以结算
 * @note: 2025/08/28 @abby
 * @returns
 */
export const selectPosCheckoutBtnStatus = createSelector(
  [selectLineItemsAndServiceLineItems, selectedCustomerId],
  (cartItems, customerId) => {
    const res = {
      disabled: true,
      loading: false,
    };

    console.log('cartItems', cartItems);
    console.log('customerId', customerId);
    console.log('res', res);
    if (cartItems && customerId) {
      res.disabled = !(cartItems.length > 0);
    }
    return res;
  }
);
