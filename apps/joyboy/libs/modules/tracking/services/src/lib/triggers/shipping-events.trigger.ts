import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { gaTrack } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';
import type {
  GAShippingSelectorEventName,
  GAShippingSelectorEventPayloadSchema,
  ShippingSelectorTriggerPayloadSchema,
} from '../entity/ga-events.schema';

/**
 * @description Track the GA `zipcode_shipping_calculator` event.
 * @scenario Aggregated by `shipping-tracking.listener` from per-domain
 *           interaction events (PDP / PLP Quickship / Cart / Checkout). The
 *           listener resolves the correct `action` + `label` from the source
 *           surface and forwards them here — this trigger no longer reads any
 *           page context.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=zipcode_shipping_calculator`.
 *       `action` and `label` are typed unions, see `ShippingSelectorAction` /
 *       `ShippingSelectorLabel`.
 */
export const trackShippingSelectorEvent = createAsyncThunk(
  'tracking/trackShippingSelectorEvent',
  async (payload: ShippingSelectorTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.action || !payload.label) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params: GAShippingSelectorEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAShippingSelectorEventName,
      'eventDetails.category': 'zipcode_shipping_calculator',
      'eventDetails.action': payload.action,
      'eventDetails.label': payload.label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
