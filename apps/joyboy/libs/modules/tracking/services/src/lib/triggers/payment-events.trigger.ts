import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import type {
  ClickPaymentMethodTriggerPayloadSchema,
  GAClickPaymentMethodEventName,
  GAClickPaymentMethodEventPayloadSchema,
  ClickPlaceOrderTriggerPayloadSchema,
  GAClickPlaceOrderEventName,
  GAClickPlaceOrderEventPayloadSchema,
} from '../entity/ga-events.schema';

export const trackGAClickPaymentMethodEvent = createAsyncThunk(
  'tracking/trackGAClickPaymentMethodEvent',
  async (payload: ClickPaymentMethodTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.category || !payload.label) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    const params: GAClickPaymentMethodEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickPaymentMethodEventName,
      'eventDetails.category': payload.category,
      'eventDetails.action': 'click_payment_method',
      'eventDetails.label': payload.label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

export const trackGAClickPlaceOrderEvent = createAsyncThunk(
  'tracking/trackGAClickPlaceOrderEvent',
  async (payload: ClickPlaceOrderTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.category || !payload.label) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    const params: GAClickPlaceOrderEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickPlaceOrderEventName,
      'eventDetails.action': 'click_place_order',
      'eventDetails.category': payload.category,
      'eventDetails.label': payload.label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
