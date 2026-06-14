import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import { TRACKING_MSGS_MAP } from '../helpers';
import { logger } from '@castlery/observability/client';
import type {
  GAOutdatedBannerCategory,
  GAOutdatedBannerImpressionEventName,
  GAOutdatedBannerImpressionEventPayloadSchema,
  OutdatedBannerImpressionTriggerPayloadSchema,
  OutdatedBannerKind,
  GAViewServiceGuaranteeEventName,
  GAViewServiceGuaranteeEventPayloadSchema,
  ViewServiceGuaranteeTriggerPayloadSchema,
  ClickServiceGuaranteePolicyTriggerPayloadSchema,
  GAClickServiceGuaranteePolicyEventName,
  GAClickServiceGuaranteePolicyEventPayloadSchema,
  GAClickServiceGuaranteePolicyPosition,
  ClickServiceGuaranteePolicyTriggerPosition,
  GAViewProductRecommendationEventName,
  GAViewProductRecommendationEventPayloadSchema,
  GAViewProductRecommendationPosition,
  ViewProductRecommendationTriggerPayloadSchema,
  ViewProductRecommendationTriggerPosition,
} from '../entity/ga-events.schema';

/**
 * Maps the cart-domain `kind` discriminator to the GA `eventDetails.category`
 * string. Single source of truth — keep in sync with the docs and schema.
 */
const OUTDATED_BANNER_CATEGORY_BY_KIND: Record<OutdatedBannerKind, GAOutdatedBannerCategory> = {
  price_change: 'price_change_banner_impression',
  out_of_stock: 'out_stock_banner_impression',
};

const CLICK_SERVICE_GUARANTEE_POLICY_POSITION_MAP: Record<
  ClickServiceGuaranteePolicyTriggerPosition,
  GAClickServiceGuaranteePolicyPosition
> = {
  miniCart: 'mini_cart',
  fullCart: 'full_cart',
};

const VIEW_PRODUCT_RECOMMENDATION_POSITION_MAP: Record<
  ViewProductRecommendationTriggerPosition,
  GAViewProductRecommendationPosition
> = {
  miniCart: 'mini_cart',
  fullCart: 'full_cart',
  others: 'others',
};

/**
 * @description Track the impression of the cart-item outdated banner (price
 *              change / out-of-stock variants) on GA.
 * @scenario `WebCartItem` renders `<OutDatedNotice />` when `isItemOutdated(item)`
 *           returns true, and fires this trigger from a `useEffect` so the
 *           impression is captured on mount and on any subsequent flag change.
 * @note Only the GA channel is reported here; other channels are not needed
 *       for this banner impression. The dynamic `label` (`${sku} | ${name}`)
 *       is assembled by the listener and passed through verbatim.
 */
export const trackGAOutdatedBannerImpressionEvent = createAsyncThunk(
  'tracking/trackGAOutdatedBannerImpressionEvent',
  async (payload: OutdatedBannerImpressionTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { kind, label } = payload;
      const category = OUTDATED_BANNER_CATEGORY_BY_KIND[kind];
      if (!category || !label) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params: GAOutdatedBannerImpressionEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAOutdatedBannerImpressionEventName,
        'eventDetails.category': category,
        'eventDetails.label': label,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA outdated banner impression event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackGAViewProductRecommendationEvent = createAsyncThunk(
  'tracking/trackGAViewProductRecommendationEvent',
  async (payload: ViewProductRecommendationTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { label, position } = payload;
      const gaPosition = VIEW_PRODUCT_RECOMMENDATION_POSITION_MAP[position];
      if (!label || !gaPosition) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params: GAViewProductRecommendationEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAViewProductRecommendationEventName,
        'eventDetails.category': 'cart_recommendation',
        'eventDetails.action': 'view_product_recommendation',
        'eventDetails.label': label,
        'eventDetails.position': gaPosition,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA view product recommendation event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track the impression of the cart service-guarantee section on GA.
 * @scenario Cart surfaces render the shared `<ServiceGurantee />` block. The
 *           cart-side wrapper `<CartServiceGuaranteeImpression />` observes the
 *           block with `useFirstInViewWithDelay` (≥1s uninterrupted dwell),
 *           which fires the impression exactly once per mount and then
 *           disconnects the observer.
 * @note Only the GA channel is reported here. `position` is carried verbatim
 *       from the cart-domain interaction event; the trigger does not infer it.
 */
export const trackGAViewServiceGuaranteeEvent = createAsyncThunk(
  'tracking/trackGAViewServiceGuaranteeEvent',
  async (payload: ViewServiceGuaranteeTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { position } = payload;
      if (!position) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params: GAViewServiceGuaranteeEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAViewServiceGuaranteeEventName,
        'eventDetails.category': 'cart_service',
        'eventDetails.action': 'view_service_guarantee',
        'eventDetails.position': position,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA view service guarantee event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track service-guarantee policy / T&Cs link clicks on GA.
 * @scenario Cart surfaces render the shared `<ServiceGurantee />` block
 *           through `<CartServiceGuaranteeImpression />`. The wrapper receives
 *           card link clicks from the shared service-guarantee item and
 *           dispatches a cart-domain event with the card title as `label`.
 * @note Only the GA channel is reported here. `position` is normalized to the
 *       snake_case value expected by the GTM contract.
 */
export const trackGAClickServiceGuaranteePolicyEvent = createAsyncThunk(
  'tracking/trackGAClickServiceGuaranteePolicyEvent',
  async (payload: ClickServiceGuaranteePolicyTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { label, position } = payload;
      const gaPosition = CLICK_SERVICE_GUARANTEE_POLICY_POSITION_MAP[position];
      if (!label || !gaPosition) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      const params: GAClickServiceGuaranteePolicyEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickServiceGuaranteePolicyEventName,
        'eventDetails.category': 'cart_service',
        'eventDetails.action': 'click_service_guarantee_policy',
        'eventDetails.label': label,
        'eventDetails.position': gaPosition,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA click service guarantee policy event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
