import { getWebOrderByUid } from '../api/order.api';

export const gotWebOrderByUidErrorEvent = getWebOrderByUid.matchRejected;
