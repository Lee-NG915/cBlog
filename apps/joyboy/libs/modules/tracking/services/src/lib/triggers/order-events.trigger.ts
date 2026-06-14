import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import type {
  GAClickAtcEventName,
  GAClickAtcEventPayloadSchema,
  ClickPayOrderHistoryTriggerPayloadSchema,
  GAClickPayOrderHistoryEventName,
  GAClickPayOrderHistoryEventPayloadSchema,
  GAClickCancelOrderEventName,
  GAClickCancelOrderEventPayloadSchema,
  GAViewCanceledOrderEventName,
  GAViewCanceledOrderEventPayloadSchema,
  GAViewPendingPaymentOrderEventName,
  GAViewPendingPaymentOrderEventPayloadSchema,
  GAOrderTrackingLinkClickEventName,
  GAOrderTrackingLinkClickEventPayloadSchema,
} from '../entity/ga-events.schema';

export const trackGAClickAtcEvent = createAsyncThunk(
  'tracking/trackGAClickAtcEvent',
  async (_: void, { fulfillWithValue }) => {
    const params: GAClickAtcEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickAtcEventName,
      'eventDetails.category': 'add_to_cart',
      'eventDetails.page_component': 'canceled_order',
      'eventDetails.label': 'add_to_cart',
      'eventDetails.action': 'click',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAClickPayOrderHistoryEvent = createAsyncThunk(
  'tracking/trackGAClickPayOrderHistoryEvent',
  async (payload: ClickPayOrderHistoryTriggerPayloadSchema, { fulfillWithValue }) => {
    const params: GAClickPayOrderHistoryEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickPayOrderHistoryEventName,
      'eventDetails.category': 'pending_payment_order_click',
      'eventDetails.page_component': 'pending_payment_order',
      'eventDetails.label': 'pay',
      'eventDetails.action': 'click',
      'eventDetails.tag': 'remaining_payment_time',
      'eventDetails.tag_value': payload.remainingTime,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAClickCancelOrderEvent = createAsyncThunk(
  'tracking/trackGAClickCancelOrderEvent',
  async (_: void, { fulfillWithValue }) => {
    const params: GAClickCancelOrderEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickCancelOrderEventName,
      'eventDetails.category': 'canceled_order_click',
      'eventDetails.page_component': 'canceled_order',
      'eventDetails.label': 'cancel_order',
      'eventDetails.action': 'click',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAViewCanceledOrderEvent = createAsyncThunk(
  'tracking/trackGAViewCanceledOrderEvent',
  async (_: void, { fulfillWithValue }) => {
    const params: GAViewCanceledOrderEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAViewCanceledOrderEventName,
      'eventDetails.category': 'canceled_order_view',
      'eventDetails.page_component': 'canceled_order',
      'eventDetails.action': 'impression',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAViewPendingPaymentOrderEvent = createAsyncThunk(
  'tracking/trackGAViewPendingPaymentOrderEvent',
  async (_: void, { fulfillWithValue }) => {
    const params: GAViewPendingPaymentOrderEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAViewPendingPaymentOrderEventName,
      'eventDetails.category': 'pending_payment_order_view',
      'eventDetails.page_component': 'pending_payment_order',
      'eventDetails.action': 'impression',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAOrderTrackingLinkClickEvent = createAsyncThunk(
  'tracking/trackGAOrderTrackingLinkClickEvent',
  async (_: void, { fulfillWithValue }) => {
    const params: GAOrderTrackingLinkClickEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAOrderTrackingLinkClickEventName,
      'eventDetails.category': 'order_tracking_link_click',
      'eventDetails.page_component': 'tracking_link',
      'eventDetails.label': 'tracking_link',
      'eventDetails.action': 'click',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
