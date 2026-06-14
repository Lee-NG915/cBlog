import { updateCustomerAddress, createCustomerAddress } from '../api/address.api';
import { isAnyOf } from '@reduxjs/toolkit';

export const customerAddressUpdatedEvent = isAnyOf(
  updateCustomerAddress.matchFulfilled,
  createCustomerAddress.matchFulfilled
);
