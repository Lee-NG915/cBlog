import { getCurrentAdmin } from "../api/user.api";

export const adminUpdateEvent = getCurrentAdmin.matchFulfilled;
