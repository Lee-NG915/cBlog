import { getOauthToken } from "../api/oauth.api";

export const tokenRefreshedEvent = getOauthToken.matchFulfilled;
