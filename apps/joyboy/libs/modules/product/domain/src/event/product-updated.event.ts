import { getProductByIdOrSlug } from '../api/product.api';
import { changeProduct } from '../slice/product.slice';
export const productUpdatedEvent = getProductByIdOrSlug.matchFulfilled;
export const productClientInitializedEvent = changeProduct;
