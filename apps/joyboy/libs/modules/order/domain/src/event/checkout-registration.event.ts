import { checkoutRegistration } from '../api/order.api';

export const checkoutRegistrationEvent = checkoutRegistration.matchFulfilled;
