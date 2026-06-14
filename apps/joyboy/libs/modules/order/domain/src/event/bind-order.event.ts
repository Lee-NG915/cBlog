import { bindOrderToUser } from "../api/order.api";
export const bindOrderToUserSuccessEvent = bindOrderToUser.matchFulfilled;