import { getSwatchesByProductId } from '../api/product.api';

export const swatchUpdatedEvent = getSwatchesByProductId.matchFulfilled;

export const swatchLoadingUpdatedEvent = getSwatchesByProductId.matchPending;

export const swatchErrorUpdatedEvent = getSwatchesByProductId.matchRejected;
