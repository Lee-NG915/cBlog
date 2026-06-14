import { EVENTS_NAMES_MAP, gaTrack } from '@castlery/modules-tracking-services';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability/client';

export const trackGeneralLinkClickEvent = createAsyncThunk(
  'tracking/trackGeneralLinkClickEvent',
  async (
    payload: {
      category?: string;
      label: string;
      link: string;
      dimension5?: string;
    },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': payload.category || 'link_click',
        'eventDetails.action': payload.label,
        'eventDetails.label': payload.link,
        'eventDetails.dimension5': payload.dimension5,
      };
      if (!payload.dimension5) {
        delete params['eventDetails.dimension5'];
      }
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackGeneralLinkClickEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

export const trackGeneralLinkRedirectEvent = createAsyncThunk(
  'tracking/trackGeneralLinkRedirectEvent',
  async (
    payload: {
      label: string;
      link: string;
    },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'link_redirect',
        'eventDetails.action': payload.label,
        'eventDetails.label': payload.link,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackGeneralLinkRedirectEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);
