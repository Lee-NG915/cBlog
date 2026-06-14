import { TRACKING_MSGS_MAP } from '../helpers';
import { gaTrack } from '../utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability/client';

export const trackCasaEvent = createAsyncThunk(
  'tracking/trackCasaEvent',
  async (payload: { eventName: string; eventParams: { [key: string]: any } }, { fulfillWithValue }) => {
    try {
      const params = {
        event: payload.eventName,
        ...payload.eventParams,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackCasaEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
