import { createPosOrder } from "../api/order.api";

export const PosOrderCreatedEvent = createPosOrder.matchFulfilled;
