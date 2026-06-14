/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Order } from '@castlery/types';

export interface ATCApiPayload extends Pick<Order, 'number'> {
  variant_id?: number;
  quantity: number; //在加车时, required，在添加service时，optional
  /**
   * Optional source of the add to cart action, used only for tracking.
   * This field is ignored by the backend business logic.
   */
  source?: string;
  /**
   * Optional position of the add to cart action, used only for tracking.
   * This field is ignored by the backend business logic.
   */
  position?: string;
  /**
   * When true, the global error modal in composite.listener is suppressed.
   * Use this when the caller handles the error UI locally.
   * This field is stripped before the request is sent to the API.
   */
  suppressDefaultErrorModal?: boolean;
  /**
   * When true, the ATC tracking event (EVENT_CART_ACTION) in order.listener is suppressed.
   * Use this when the caller owns its own tracking (e.g. 3rd-party integrations like Hulla).
   * This field is stripped before the request is sent to the API.
   */
  suppressTracking?: boolean;
  options?: {
    //在加车时，options required，在添加service时，optional
    preferred_self_collection: boolean;
    preferred_stock_location_id?: number;
    warranty_offer_id?: number | string;
  };
  // TODO 要在这里处理bundle的加车问题
  // & (BundleOptions | CustomizeOptions | (BundleOptions & CustomizeOptions) | never);
}

export enum AdjustmentType {
  'fixed_amount' = 'fixed_amount',
  'percentage' = 'percentage',
}
/**
 * The payload of "Adjust Price" request
 * @orderNumber
 * @lineItemId
 * @adjustment {number} the amount of adjustment
 * @type {AdjustmentType} the type of adjustment, `fixed_amount` or `percentage`
 */
export interface AdjustPriceApiPayload {
  orderNumber: string;
  lineItemId: number;
  adjustment: number;
  type: keyof typeof AdjustmentType;
}

/**
 * The payload of "Change Item Quantity" request
 * @orderNumber {string}
 * @lineItemId {number}
 * @quantity {number}
 * @options {warranty_offer_id?:number} the warranty offer id
 */
export interface ChangeItemQuantityApiPayload {
  orderNumber: string;
  lineItemId: number;
  quantity: number;
  options: {
    warranty_offer_id?: string;
  };
}

/**
 * The payload of "Remove Line Item" request
 * @orderNumber {string}
 * @lineItemId {number}
 */
export interface RemoveLineItemApiPayload {
  orderNumber: string;
  lineItemId: number;
}

export interface OrderTransferApiPayload extends Pick<Order, 'number'> {
  itemIds: number[];
}

export interface ApplyCouponApiPayload extends Pick<Order, 'number'> {
  couponCode: string;
}
