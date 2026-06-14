import { isAnyOf } from '@reduxjs/toolkit';
import {
  confirmDelivery,
  changeAddressByOrderNumber,
  changeDeliveryDate,
  addServiceProduct,
  changeDeliveryOption,
  changeServiceType,
} from '../api/shipping.api';
import { sendStripePaymentLink, addPayMethod, removePayMethod, completePay } from '../api/payment.api';

export const checkoutUpdatedEvent = isAnyOf(
  changeDeliveryDate.matchFulfilled,
  changeAddressByOrderNumber.matchFulfilled,
  addPayMethod.matchFulfilled,
  removePayMethod.matchFulfilled,
  sendStripePaymentLink.matchFulfilled,
  completePay.matchFulfilled,
  confirmDelivery.matchFulfilled,
  confirmDelivery.matchRejected,
  addServiceProduct.matchFulfilled,
  changeServiceType.matchFulfilled
);

export const deliveryUpdatedEvent = isAnyOf(
  changeAddressByOrderNumber.matchFulfilled,
  changeDeliveryDate.matchFulfilled,
  changeDeliveryOption.matchFulfilled
);
