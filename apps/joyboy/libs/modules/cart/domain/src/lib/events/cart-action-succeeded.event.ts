import { createAction } from '@reduxjs/toolkit';
import type { LineItemSchema } from '@castlery/types';

/**
 * @description ATC scene tag — explicitly declared by the caller (thunk / UI) so the
 * downstream tracking listener never needs to reverse-engineer the source from the
 * RTK Query mutation meta.
 */
export type AtcScene = 'pdp-web' | 'pdp-pos' | 'swatch' | 'rec-list' | 'cart-list' | 'gift' | 'batch';

/**
 * @description ATC type — aligned with the `atcType` field consumed by
 * add-to-cart tracking triggers ('regular' | '1click' | 'ai').
 */
export type AtcType = 'regular' | '1click' | 'ai' | 'free_gift';

export interface CartTrackingCustomerPayload {
  userStatus: 'logged-in' | 'logged-out';
  userEmail: string;
  userEmail2: string;
}

export interface CartTrackingContextPayload {
  lineItem: LineItemSchema;
  quantityDifference: number;
  cartLineItems: LineItemSchema[];
  cartItemTotal: string;
  customer: CartTrackingCustomerPayload;
}

export interface AddedCartActionSucceededPayload {
  variantId: number;
  quantityDifference: number;
  atcType: AtcType;
  scene: AtcScene;
  source: string;
  tracking: CartTrackingContextPayload;
}

export interface UpdatedCartQtyActionSucceededPayload {
  variantId: number;
  lineItemId: string;
  tracking: CartTrackingContextPayload;
}

export interface RemovedCartActionSucceededPayload {
  lineItem: LineItemSchema;
  tracking: CartTrackingContextPayload;
}

/**
 * @description Swatch payload carries sku/skuName directly because the UI / thunk already
 * has them at dispatch time (no need for a cart lookup).
 */
export interface AddedSwatchActionSucceededPayload {
  sku: string;
  skuName: string;
  relatedProductId?: number;
  relatedProductSlug?: string;
}

export interface AddedGiftActionSucceededPayload {
  variantId: number;
  giftId: string;
  campaignName: string;
  label: 'miniCart' | 'fullCart';
  source: string;
  tracking: CartTrackingContextPayload;
}

export const addedCartActionSucceededEvent = createAction<AddedCartActionSucceededPayload>(
  'cart/addedCartActionSucceeded'
);

/**
 * @description Dispatched after a successful cart line-item quantity update.
 * Tracking listener decides add_to_cart vs remove_from_cart based on `newQuantity - prevQuantity`.
 */
export const updatedCartQtyActionSucceededEvent = createAction<UpdatedCartQtyActionSucceededPayload>(
  'cart/updatedCartQtyActionSucceeded'
);

/**
 * @description Dispatched after a successful cart line-item removal. Payload carries the line
 * item directly so tracking no longer needs the `recordRemovedItem` slice as a relay.
 */
export const removedCartActionSucceededEvent = createAction<RemovedCartActionSucceededPayload>(
  'cart/removedCartActionSucceeded'
);

/**
 * @description Dispatched after a successful free-swatch ATC. Kept separate from regular ATC
 * because swatch has its own tracking trigger (`trackAddSwatchEvent`).
 */
export const addedSwatchActionSucceededEvent = createAction<AddedSwatchActionSucceededPayload>(
  'cart/addedSwatchActionSucceeded'
);

/** @description Reserved for future free-gift tracking. Currently has no tracking subscriber. */
export const addedGiftActionSucceededEvent = createAction<AddedGiftActionSucceededPayload>(
  'cart/addedGiftActionSucceeded'
);
