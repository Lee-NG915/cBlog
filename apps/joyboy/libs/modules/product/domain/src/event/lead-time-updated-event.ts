import { getLeadtimeShippingFee } from "../api/product.api";
export const leadTimeUpdatedEvent = getLeadtimeShippingFee.matchFulfilled;
