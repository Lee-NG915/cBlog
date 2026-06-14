import { login } from '../api/oauth.api';

export const loggedInEvent = login.matchFulfilled;
