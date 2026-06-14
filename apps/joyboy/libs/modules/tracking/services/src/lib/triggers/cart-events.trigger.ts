import { createAsyncThunk } from '@reduxjs/toolkit';
import { EcEnv, INTL_CURRENCY } from '@castlery/config';
import type { LineItem, LineItemSchema } from '@castlery/types';
import { logger } from '@castlery/observability/client';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  getProductNeedTracking,
  TRACKING_MSGS_MAP,
  getGAEccFormattedProduct,
  getGAEccFormattedProducts,
} from '../helpers';
import { gaTrack, getEventRandomId } from '../utils';
import { trackFacebookAddToCartEvent } from './fb-capi-events.trigger';
import { trackPinterestAddToCartEvent } from './pinterest-capi-events.trigger';
import { trackAddSwatchEvent } from './swatch.trigger';
import { trackDYAddToCartEvent } from './dy-events.trigger';
import { trackKlaviyoAddedToCartEvent } from './klaviyo-events.trigger';
import { logTrackingError, logTrackingInfo, logTrackingWarn } from '../utils';
import type {
  GAClickCartIconEventName,
  GAClickCartIconEventPayloadSchema,
  ClickCheckoutTriggerPayloadSchema,
  ClickCheckoutTriggerPosition,
  GAClickCheckoutEventName,
  GAClickCheckoutEventPayloadSchema,
  GAClickCheckoutPosition,
  GARefreshCartEventName,
  GARefreshCartEventPayloadSchema,
  GAViewCartEventName,
  GAViewCartEventPayloadSchema,
  RefreshCartTriggerPayloadSchema,
  ViewCartTriggerPayloadSchema,
} from '../entity/ga-events.schema';

type LegacyTrackedProduct = ReturnType<typeof getProductNeedTracking>;

const CLICK_CHECKOUT_POSITION_MAP: Record<ClickCheckoutTriggerPosition, GAClickCheckoutPosition> = {
  miniCart: 'mini_cart',
  fullCart: 'full_cart',
};

export const trackAddToCartEvent = createAsyncThunk(
  'tracking/trackAddToCartEvent',
  async (
    payload: {
      trackedProduct: LegacyTrackedProduct;
      cartLineItems: LineItem[];
      qtyIncrements: number;
      itemTotal: string;
      atcType?: 'regular' | '1click' | 'GenAI Casa';
      position?: string;
    },
    { dispatch, fulfillWithValue }
  ) => {
    const { trackedProduct, cartLineItems } = payload;
    if (!trackedProduct || !cartLineItems) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    try {
      const eventId = getEventRandomId(EVENTS_NAMES_MAP.GA_ADD_TO_CART);
      const params = {
        event: EVENTS_NAMES_MAP.GA_ADD_TO_CART,
        eventId,
        ecommerce: {
          currencyCode: EcEnv.NEXT_PUBLIC_CURRENCY,
          add: {
            products: [trackedProduct],
          },
        },
        atc_type: payload.atcType || 'regular',
        'eventDetails.position': payload.position ?? '',
      };
      gaTrack(params);

      await dispatch(
        trackFacebookAddToCartEvent({
          eventId,
          variant: { name: trackedProduct.name, sku: trackedProduct.id },
          originalPrice: trackedProduct.price,
        })
      );
      await dispatch(
        trackPinterestAddToCartEvent({
          eventId,
          variant: { sku: trackedProduct.id, name: trackedProduct.name },
          originalPrice: trackedProduct.price,
        })
      );
      await dispatch(
        trackDYAddToCartEvent({
          cartLineItems,
          variant: { sku: trackedProduct.id, name: trackedProduct.name, quantity: trackedProduct.quantity },
          targetPrice: Number(trackedProduct.price),
        })
      );
      await dispatch(
        trackKlaviyoAddedToCartEvent({
          targetVariantSku: trackedProduct.id,
          qtyIncrements: payload.qtyIncrements,
          cartLineItems,
          itemTotal: payload.itemTotal,
        })
      );
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackAddToCartEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackCartActionEvent = createAsyncThunk(
  'tracking/trackCartActionEvent',
  async (
    payload: {
      actionType: 'add' | 'increase' | 'decrease' | 'remove';
      lineItem: LineItem;
      quantityDifference?: number;
      atcSource?: 'regular' | '1click' | 'GenAI Casa';
      /**
       * Optional position of the cart action, propagated from add to cart command.
       */
      atcPosition?: string;
    },
    { fulfillWithValue, dispatch }
  ) => {
    if (!payload.actionType || !payload.lineItem) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    try {
      const { actionType, lineItem, quantityDifference = 1, atcSource, atcPosition } = payload;
      const isSwatch = !!lineItem?.is_swatch;
      const isIncreased = actionType === 'increase' || actionType === 'add';
      const { variant } = lineItem;

      if (isSwatch) {
        if (isIncreased) {
          return await dispatch(
            trackAddSwatchEvent({
              sku: variant.sku,
              skuName: variant.name,
            })
          );
        }
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
      }

      const trackedProduct = getProductNeedTracking(lineItem, quantityDifference);
      if (isIncreased) {
        return await dispatch(
          trackAddToCartEvent({
            trackedProduct,
            cartLineItems: [lineItem],
            qtyIncrements: quantityDifference,
            itemTotal: String(Number(lineItem.variant.price) * lineItem.quantity),
            atcType: atcSource ?? 'regular',
            position: atcPosition,
          })
        );
      }

      const legacyRemoveProduct = getProductNeedTracking(lineItem);
      const params = {
        event: EVENTS_NAMES_MAP.GA_REMOVE_FROM_CART,
        ecommerce: {
          currencyCode: EcEnv.NEXT_PUBLIC_CURRENCY,
          remove: {
            products: [legacyRemoveProduct],
          },
        },
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackCartEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * For ORP - tracking remove from cart event
 */
export const trackGARemoveFromCartEvent = createAsyncThunk(
  'tracking/trackGARemoveFromCartEvent',
  async (
    payload: {
      lineItem: LineItemSchema;
      quantityDifference: number;
    },
    { fulfillWithValue }
  ) => {
    const { lineItem, quantityDifference } = payload;
    if (!lineItem) {
      logTrackingWarn('GA', EVENTS_NAMES_MAP.GA_REMOVE_FROM_CART, 'required lineItem not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const trackedProduct = getGAEccFormattedProduct(lineItem, quantityDifference);
      const params = {
        event: EVENTS_NAMES_MAP.GA_REMOVE_FROM_CART,
        ecommerce: {
          currencyCode: INTL_CURRENCY,
          remove: {
            products: [trackedProduct],
          },
        },
      };
      logTrackingInfo('GA', EVENTS_NAMES_MAP.GA_REMOVE_FROM_CART, { trackedProduct });
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logTrackingError('GA', EVENTS_NAMES_MAP.GA_REMOVE_FROM_CART, error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track the GA `refresh_cart` event.
 * @scenario Driven by `cart-tracking.listener` from the cart-domain
 *           `cartRefreshButtonClickedEvent`, which fires on every click of
 *           `<CartRefreshButton>` (no API-completion wait, no dedup). The
 *           listener passes `surface` (`miniCart` | `fullCart`) through as
 *           `label`; this trigger does no further mapping.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=refresh_cart`.
 */
export const trackRefreshCartEvent = createAsyncThunk(
  'tracking/trackRefreshCartEvent',
  async (payload: RefreshCartTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.label) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params: GARefreshCartEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GARefreshCartEventName,
      'eventDetails.category': 'refresh_cart',
      'eventDetails.label': payload.label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

/**
 * @description Track the GA `click_cart_icon` event.
 * @scenario Driven by `tracking.listener` from the product-domain
 *           `cartIconClickedEvent`, which fires when the user clicks the cart
 *           icon in the website navigation bar. Every click is tracked.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=click_cart_icon`.
 */
export const trackGAClickCartIconEvent = createAsyncThunk(
  'tracking/trackGAClickCartIconEvent',
  async (_, { fulfillWithValue }) => {
    try {
      const params: GAClickCartIconEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickCartIconEventName,
        'eventDetails.category': 'click_cart_icon',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackGAClickCartIconEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackClickCheckoutEvent = createAsyncThunk(
  'tracking/trackClickCheckoutEvent',
  async (payload: ClickCheckoutTriggerPayloadSchema, { fulfillWithValue }) => {
    const position = CLICK_CHECKOUT_POSITION_MAP[payload.position];
    if (!position) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params: GAClickCheckoutEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickCheckoutEventName,
      'eventDetails.category': 'cart_summary',
      'eventDetails.action': 'click_checkout',
      'eventDetails.position': position,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

/**
 * @description Track the GA `view_cart` event.
 * @scenario Driven by `cart-tracking.listener` from the cart-domain
 *           `cartViewedEvent`. fullCart fires once per `PageClient` mount when
 *           cart line items first become non-empty; miniCart fires on the
 *           drawer's first open per mount. Listener guards empty line items.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=view_cart`,
 *       `ecommerce.cart.products` formatted via `getGAEccFormattedProducts`.
 */
export const trackViewCartEvent = createAsyncThunk(
  'tracking/trackViewCartEvent',
  async (payload: ViewCartTriggerPayloadSchema, { fulfillWithValue }) => {
    const { label, lineItems } = payload;
    if (!lineItems?.length) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const products = getGAEccFormattedProducts(lineItems).filter(
        (item): item is NonNullable<typeof item> => item !== null
      );
      if (!products.length) {
        logTrackingWarn('GA', 'view_cart', 'no trackable products');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params: GAViewCartEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAViewCartEventName,
        'eventDetails.category': 'view_cart',
        'eventDetails.label': label,
        ecommerce: {
          currencyCode: INTL_CURRENCY!,
          cart: { products },
        },
      };
      logTrackingInfo('GA', 'view_cart', { params });
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logTrackingError('GA', 'view_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description For ORP - tracking add to cart event
 */
export const trackGAAddedToCartEvent = createAsyncThunk(
  'tracking/trackGAAddedToCartEvent',
  async (
    payload: {
      targetLineItem: LineItemSchema;
      quantityDifference: number;
      customer: {
        userStatus: 'logged-in' | 'logged-out';
        userEmail: string;
        userEmail2: string;
      };
      atcType?: 'regular' | '1click' | 'ai' | 'free_gift';
    },
    { fulfillWithValue }
  ) => {
    const { targetLineItem, quantityDifference, customer, atcType } = payload;
    if (!targetLineItem) {
      logTrackingWarn('GA', EVENTS_NAMES_MAP.GA_ADD_TO_CART, 'required targetLineItem not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const trackedProduct = getGAEccFormattedProduct(targetLineItem, quantityDifference);
      if (!trackedProduct) {
        logTrackingWarn('GA', EVENTS_NAMES_MAP.GA_ADD_TO_CART, 'required trackedProduct not found');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params = {
        event: EVENTS_NAMES_MAP.GA_ADD_TO_CART,
        eventId: getEventRandomId(EVENTS_NAMES_MAP.GA_ADD_TO_CART),
        userStatus: customer.userStatus,
        userEmail: customer.userEmail,
        userEmail2: customer.userEmail2,
        atc_type: atcType || 'regular',
        eventDetails: {
          position: '', // 未明确该字段含义，暂时留空
        },
        ecommerce: {
          currencyCode: INTL_CURRENCY,
          add: {
            products: [trackedProduct],
          },
        },
      };
      logTrackingInfo('GA', EVENTS_NAMES_MAP.GA_ADD_TO_CART, { params });
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logTrackingError('GA', EVENTS_NAMES_MAP.GA_ADD_TO_CART, error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
