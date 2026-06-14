import { createUserFromWebChannel } from '../api/user.api';

export const webSignedUpEvent = createUserFromWebChannel.matchFulfilled;
