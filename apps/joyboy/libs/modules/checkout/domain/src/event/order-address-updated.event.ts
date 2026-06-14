import { changeAddressByOrderNumber } from '../api/shipping.api';
import { validateAddressForShippingAndUpdate } from '../api/address.api';

export const orderAddressUpdatedEvent = changeAddressByOrderNumber.matchFulfilled;

export const validateAddressForShippingAndUpdateEvent = validateAddressForShippingAndUpdate.matchFulfilled;
