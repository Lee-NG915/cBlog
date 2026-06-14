import { generatePos } from "../api/stripe-init.api";
export const posGeneratedEvent = generatePos.matchFulfilled;