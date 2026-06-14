import { updateCheckoutShippingMethod } from '../api/checkout-session.api';

export const shippingMethodUpdatedEvent = updateCheckoutShippingMethod.matchFulfilled;
