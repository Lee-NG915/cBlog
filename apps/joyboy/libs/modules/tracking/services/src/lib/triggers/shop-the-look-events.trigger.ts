import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { gaTrack, trackDy } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';

/**
 * @description track form submit event
 * @scenario 1. Triggered when a user submits a form on the website
 */
export const trackShopTheLookEvent = createAsyncThunk(
  'tracking/trackFormSubmitEvent',
  async (payload: { action: string; label: string; eventId?: string }, { dispatch, fulfillWithValue }) => {
    const { action, label } = payload;
    if (!action) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
      'eventDetails.category': 'shop_the_look',
      'eventDetails.action': action,
      'eventDetails.label': label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
