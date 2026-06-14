import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { gaTrack, trackDy } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';
import { trackDYNewsletterSubscriptionEvent } from './dy-events.trigger';

/**
 * @description track form submit event
 * @scenario 1. Triggered when a user submits a form on the website
 */
export const trackFormSubmitEvent = createAsyncThunk(
  'tracking/trackFormSubmitEvent',
  async (
    payload: { action: string; label: string; method: string; eventId?: string; position?: string },
    { dispatch, fulfillWithValue }
  ) => {
    const { action, label, method, position } = payload;
    if (!action) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
      eventId: payload.eventId ?? '',
      'eventDetails.category': 'Form',
      'eventDetails.action': action,
      'eventDetails.label': label,
      'eventDetails.method': method,
      'eventDetails.position': position ?? '',
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
