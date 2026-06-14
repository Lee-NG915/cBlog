import { isAnyOf } from '@reduxjs/toolkit';
import {
  addToOrder,
  removeLineItem,
  adjustLineItemPrice,
  applyCouponV1,
  removeCouponV1,
  orderItemsTransfer,
  bindOrderToUser,
  overWriteServiceProductPrice,
  refreshPrice,
  addItemQuantity,
  reduceItemQuantity,
  refreshCheckout,
} from '../api/order.api';

/**
 * @description manual operation results in changing the order data
 * @scenario add item to order,which corresponds 'Add To Cart'
 * @scenario remove item from order
 * @scenario change the quantity of the item
 * @scenario adjust the price of the item, which corresponds 'Set Discount'
 * @scenario apply coupon to order,which corresponds 'Apply' in coupon wallet
 * @scenario transfer the items in online cart to the pos order
 * @scenario update the addon services,which corresponds 'Add Service'
 * @scenario bind order to user
 */
export const orderUpdatedEvent = isAnyOf(
  addToOrder.matchFulfilled,
  removeLineItem.matchFulfilled,
  addItemQuantity.matchFulfilled,
  reduceItemQuantity.matchFulfilled,
  adjustLineItemPrice.matchFulfilled,
  applyCouponV1.matchFulfilled,
  orderItemsTransfer.matchFulfilled,
  bindOrderToUser.matchFulfilled,
  overWriteServiceProductPrice.matchFulfilled,
  removeCouponV1.matchFulfilled,
  refreshPrice.matchFulfilled,
  refreshCheckout.matchFulfilled
);
