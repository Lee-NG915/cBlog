import { EVENTS_NAMES_MAP, gaTrack } from '@castlery/modules-tracking-services';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability/client';

export const trackGeneralSubmitFormEvent = createAsyncThunk(
  'tracking/trackGeneralSubmitFormEvent',
  async (
    payload: {
      action?: string;
      label?: string;
      method?: string;
    },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Form',
        'eventDetails.action': payload.action || '',
        'eventDetails.label': payload.label,
        'eventDetails.method': payload.method || '',
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackGeneralSubmitFormEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);
