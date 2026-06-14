import { isAnyOf } from '@reduxjs/toolkit';

import {
  changeDeliveryDate,
  changeAddressByOrderNumber,
  removePayMethod,
  completePay,
  confirmDelivery,
  addServiceProduct,
} from '@castlery/modules-checkout-domain';
import { addAddressToUserByUid } from '@castlery/modules-user-domain';
import {
  addToOrder,
  addItemQuantity,
  reduceItemQuantity,
  applyCouponV1,
  checkoutRegistration,
  getWebOrderByCustomer,
  mergeOrder,
  createWebOrder,
  getWebOrderByOrderNumber,
  updateWebOrder,
} from '@castlery/modules-order-domain';
import { applyCouponV2 } from '@castlery/modules-promotion-domain';

export const checkoutProcessFailedEvent = isAnyOf(
  checkoutRegistration.matchRejected,
  changeDeliveryDate.matchRejected,
  changeAddressByOrderNumber.matchRejected,
  removePayMethod.matchRejected,
  completePay.matchRejected,
  confirmDelivery.matchRejected,
  addServiceProduct.matchRejected,
  addToOrder.matchRejected,
  reduceItemQuantity.matchRejected,
  addItemQuantity.matchRejected,
  applyCouponV1.matchRejected,
  applyCouponV2.matchRejected,
  addAddressToUserByUid.matchRejected
);

export const webProcessFailedEvent = isAnyOf(
  getWebOrderByCustomer.matchRejected,
  mergeOrder.matchRejected,
  createWebOrder.matchRejected,
  getWebOrderByOrderNumber.matchRejected,
  updateWebOrder.matchRejected,
  addToOrder.matchRejected
);

export const failedEvent = isAnyOf();
export const errorMap = new Map<string, { [status: string]: string }>([
  [
    'confirmDelivery',
    {
      '40011': 'Currently we do not ship to the specified area. Please change your address.',
    },
  ],
]);

export const formatErrorMessage = (action: { meta: any; payload: any }) => {
  const endpointName = action.meta?.arg?.endpointName;
  const { code, detail } = action.payload?.data?.errors?.[0] ?? {};

  // 只有当 code 存在时才查找 errorMap，避免 code.toString() 返回 'undefined'
  const resetError = code ? errorMap.get(endpointName)?.[code.toString()] : undefined;
  const errorMessage = resetError || detail || 'Network error';

  return errorMessage;
};

export const refreshOrderAfterErrorEventNames = [changeAddressByOrderNumber.name];
