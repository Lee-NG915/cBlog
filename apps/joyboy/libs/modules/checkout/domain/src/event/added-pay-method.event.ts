import { addPayMethod, removePayMethod } from '../api/payment.api';

export const addedPayMethodEvent = addPayMethod.matchFulfilled;
export const removedPayMethodEvent = removePayMethod.matchFulfilled;
