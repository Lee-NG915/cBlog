import { getAddressesByUserId } from '../api/address.api';

export const gotAddressByUidEvent = getAddressesByUserId.matchFulfilled;
