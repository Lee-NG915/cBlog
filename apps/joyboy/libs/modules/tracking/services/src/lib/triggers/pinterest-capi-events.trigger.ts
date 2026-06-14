/**
 * @file pinterest-capi-events.trigger.ts
 * @description Capture Pinterest CAPI events by client-side code
 * @documentation https://developers.pinterest.com/docs/conversions/conversion-management/
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  PinterestAddPaymentInfoTriggerPayloadSchema,
  PinterestAddSwatchToCartTriggerPayloadSchema,
  PinterestAddToCartTriggerPayloadSchema,
  PinterestAddToWishlistTriggerPayloadSchema,
  PinterestEventIdTriggerPayloadSchema,
  PinterestPageVisitTriggerPayloadSchema,
  PinterestPurchaseTriggerPayloadSchema,
  PinterestSwatchPurchaseTriggerPayloadSchema,
  PinterestInitiateCheckoutTriggerPayloadSchema,
  PinterestNewCustomerPurchaseTriggerPayloadSchema,
} from '../entity';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildPinterestAddPaymentInfoCustomData,
  buildPinterestProductCustomData,
  buildPinterestPurchaseCustomData,
  buildPinterestRegistrationCustomData,
  buildPinterestSwatchCustomData,
  buildPinterestWishlistCustomData,
  buildPinterestInitiateCheckoutCustomData,
  buildPinterestNewCustomerPurchaseCustomData,
  logPinterestCapiInfo,
  logPinterestCapiError,
  logPinterestCapiWarn,
  TRACKING_MSGS_MAP,
} from '../helpers';
import { pinterestConversionTrack } from '../utils';

/**
 * @description track Pinterest page visit event
 * @scenario Triggered when a user views a PDP page
 * @see https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events
 */
export const trackPinterestPageVisitEvent = createAsyncThunk(
  'tracking/trackPinterestPageVisitEvent',
  async (payload: PinterestPageVisitTriggerPayloadSchema, { dispatch, fulfillWithValue }) => {
    if (!payload.eventId || !payload.originalPrice || !payload.variant) {
      logPinterestCapiWarn('page_visit', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_PRODUCT_PAGE_VIEW,
        eventId: payload.eventId,
        customData: buildPinterestProductCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('page_visit', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest add to wishlist event
 * @scenario Triggered when a user clicks "Add to Wishlist" on the PDP page
 * @see https://developers.pinterest.com/docs/conversions/custom-events/
 */
export const trackPinterestAddToWishlistEvent = createAsyncThunk(
  'tracking/trackPinterestAddToWishlistEvent',
  async (payload: PinterestAddToWishlistTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.variant || !payload.eventId) {
      logPinterestCapiWarn('add_to_wishlist', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: payload.eventId,
        customData: buildPinterestWishlistCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('add_to_wishlist', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest add to cart event
 * @scenario Triggered after a PDP add-to-cart succeeds
 * @see https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events
 */
export const trackPinterestAddToCartEvent = createAsyncThunk(
  'tracking/trackPinterestAddToCartEvent',
  async (payload: PinterestAddToCartTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.variant || !payload.eventId || !payload.originalPrice) {
      logPinterestCapiWarn('add_to_cart', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_ADD_TO_CART,
        eventId: payload.eventId,
        customData: buildPinterestProductCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('add_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest add swatch to cart event
 * @scenario Triggered after an add-swatch-to-cart succeeds
 * @see https://developers.pinterest.com/docs/conversions/custom-events/
 */
export const trackPinterestAddSwatchToCartEvent = createAsyncThunk(
  'tracking/trackPinterestAddSwatchToCartEvent',
  async (payload: PinterestAddSwatchToCartTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.variant) {
      logPinterestCapiWarn('add_swatch_to_cart', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: payload.eventId,
        customData: buildPinterestSwatchCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('add_swatch_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest signup event
 * @scenario Triggered when a user completes account registration
 * @see https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events
 */
export const trackPinterestSignupEvent = createAsyncThunk(
  'tracking/trackPinterestSignupEvent',
  async (payload: PinterestEventIdTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId) {
      logPinterestCapiWarn('signup', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_SIGNUP,
        eventId: payload.eventId,
        customData: buildPinterestRegistrationCustomData('Sign Up'),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('signup', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest newsletter subscription event
 * @scenario Triggered when a user subscribes to newsletter from the footer
 * @see https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events
 */
export const trackPinterestNewsletterSubscriptionEvent = createAsyncThunk(
  'tracking/trackPinterestNewsletterSubscriptionEvent',
  async (payload: PinterestEventIdTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId) {
      logPinterestCapiWarn('newsletter_subscription', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_SIGNUP,
        eventId: payload.eventId,
        customData: buildPinterestRegistrationCustomData('Subscription Footer'),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('newsletter_subscription', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest purchase event
 * @scenario 订单支付成功后，在 order confirmation 页面触发，上报购买行为用于 Pinterest 广告归因与优化
 * @see https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events
 * @review payload.contentIds - 确认传 SKU 数组还是 product ID 数组
 * @review customData.order_quantity - 确认字段来源（order line_items 数量）
 */
export const trackPinterestPurchaseEvent = createAsyncThunk(
  'tracking/trackPinterestPurchaseEvent',
  async (payload: PinterestPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.orderId) {
      logPinterestCapiWarn('purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_PURCHASE,
        eventId: payload.eventId,
        customData: buildPinterestPurchaseCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest swatch purchase event
 * @scenario 订单支付成功后，在 order confirmation 页面触发，仅当订单中包含 swatch 商品时上报
 * @see https://developers.pinterest.com/docs/conversions/custom-events/
 * @review customData - 确认是否需要加 value / currency（swatch 通常免费，待确认）
 * @review payload.swatchSkus - 确认字段来源（order line_items 中 is_swatch 的 variant.sku）
 */
export const trackPinterestSwatchPurchaseEvent = createAsyncThunk(
  'tracking/trackPinterestSwatchPurchaseEvent',
  async (payload: PinterestSwatchPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.swatchSkus?.length) {
      logPinterestCapiWarn('swatch_purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: payload.eventId,
        customData: buildPinterestSwatchCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('swatch_purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackPinterestNewCustomerPurchaseEvent = createAsyncThunk(
  'tracking/trackPinterestNewCustomerPurchaseEvent',
  async (payload: PinterestNewCustomerPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.orderId) {
      logPinterestCapiWarn('new_customer_purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: payload.eventId,
        customData: buildPinterestNewCustomerPurchaseCustomData(payload),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('new_customer_purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackPinterestInitiateCheckoutEvent = createAsyncThunk(
  'tracking/trackPinterestInitiateCheckoutEvent',
  async (payload: PinterestInitiateCheckoutTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    try {
      const { eventId, value, numItems, variants } = payload;

      if (!eventId || !value || !numItems || !variants) {
        logPinterestCapiWarn('initiate_checkout', 'missing required payload fields');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: eventId,
        customData: buildPinterestInitiateCheckoutCustomData({ value, numItems, variants }),
      };
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('initiate_checkout', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track Pinterest add payment info event
 * @scenario Triggered only after captureWithRetry succeeds on checkout payment
 * @see https://developers.pinterest.com/docs/conversions/custom-events/
 */
export const trackPinterestAddPaymentInfoEvent = createAsyncThunk(
  'tracking/trackPinterestAddPaymentInfoEvent',
  async (payload: PinterestAddPaymentInfoTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.contentIds?.length) {
      logPinterestCapiWarn('add_payment_info', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.PINTEREST_CAPI_CUSTOM_EVENT,
        eventId: payload.eventId,
        customData: buildPinterestAddPaymentInfoCustomData(payload),
      };
      logPinterestCapiInfo('add_payment_info', params);
      await dispatch(pinterestConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logPinterestCapiError('add_payment_info', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
