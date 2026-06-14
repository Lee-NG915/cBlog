import { changeDeliveryOption } from '../api/shipping.api';

export const deliveryOptionUpdatedEvent = changeDeliveryOption.matchFulfilled;
