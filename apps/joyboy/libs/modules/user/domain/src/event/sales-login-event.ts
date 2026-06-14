import { login } from '../api/oauth.api';

export const salesRepLoggedInEvent = login.matchFulfilled;
