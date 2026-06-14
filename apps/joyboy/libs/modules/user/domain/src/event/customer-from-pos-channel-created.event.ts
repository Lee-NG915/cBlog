import { createCustomerFromPosChannel } from '../api/user.api';

export const customerFromPosChannelCreatedEvent = createCustomerFromPosChannel.matchFulfilled;
