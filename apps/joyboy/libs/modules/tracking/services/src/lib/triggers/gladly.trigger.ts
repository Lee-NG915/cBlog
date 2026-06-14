import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { TRACKING_MSGS_MAP } from '../helpers';
import { gaTrack } from '../utils';
import { logger } from '@castlery/observability/client';

/**
 * @description tracking gladly chat button click event
 */
export const trackGladlyChatButtonClickEvent = createAsyncThunk(
  'tracking/trackGladlyChatButtonClickEvent',
  (payload: { action?: string; label?: string }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'initiate_chat',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackGladlyChatButtonClickEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
