import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@castlery/shared-redux-store';
import { EventsDataTempateHelper, EventsDataTempateNames } from '@castlery/data-tracking-events';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils/ga.util';
import { TRACKING_MSGS_MAP } from '../helpers/msg.helper';
import { logger } from '@castlery/observability/client';

export const eventDataTemplate = (dataTemplateName: EventsDataTempateNames) => {
  const EventDataTemplate = {
    EEC: (state: RootState) => {
      const order = state.order.order;
      return EventsDataTempateHelper[EventsDataTempateNames.PRODUCT](order?.line_items || []);
    },
    PRODUCT: (state: RootState) => {
      const data = state.product;
      return EventsDataTempateHelper[EventsDataTempateNames.EEC](data | {});
    },
  };
  return EventDataTemplate[dataTemplateName];
};
// 已废弃，待删除
export const trackingCmsEvent = createAsyncThunk('tracking/trackingCmsEvent', () => {
  return Promise.resolve();
});
/**
 * @description tracking usp impression event
 * @scenario 1: Every time usp component  appears on screen for more than 3 seconds
 */
export const trackingUSPImpression = createAsyncThunk(
  'tracking/trackingUSPImpression',
  (payload: { uspVariant: string }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'usp',
        'eventDetails.action': 'impression',
        'eventDetails.position': payload.uspVariant,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackingUSPImpression failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description tracking usp click event
 * @scenario 1: Every time any clickable element was clicked on USP component
 */
export const trackingUSPClick = createAsyncThunk(
  'tracking/trackingUSPClick',
  (payload: { uspVariant: string; ctaText: string }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'usp',
        'eventDetails.action': 'click',
        'eventDetails.label': 'cta_text',
        'eventDetails.method': payload.ctaText,
        'eventDetails.position': payload.uspVariant,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackingUSPClick failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description tracking ugc click event
 * @scenario 1: Every time any clickable element was clicked on ugc component
 */
export const trackingUgcClickEvent = createAsyncThunk(
  'tracking/trackingUgcClickEvent',
  (payload: { link: string; ctaText: string }, { fulfillWithValue }) => {
    try {
      const metaTitle = document ? document.title : '';
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Storyblok',
        'eventDetails.action': 'ugc_link_click',
        'eventDetails.label': payload.ctaText,
        'eventDetails.method': metaTitle,
        'eventDetails.position': payload.link || 'NA',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackingUSPClick failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description tracking storyblok event
 */
export const trackStoryblokEvent = createAsyncThunk(
  'tracking/trackStoryblokEvent',
  (payload: { action?: string; label?: string; method?: string; position?: string }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Storyblok',
        'eventDetails.action': payload.action ?? '',
        'eventDetails.label': payload.label ?? '',
        'eventDetails.method': payload.method ?? '',
        'eventDetails.position': payload.position ?? '',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackStoryblokEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description tracking customer review impression event
 */
export const trackCustomerReviewImpression = createAsyncThunk(
  'tracking/trackCustomerReviewImpression',
  (payload: { action?: string; label?: string; method?: string; position?: string }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Trustpilot',
        'eventDetails.action': 'impression',
        'eventDetails.label': 'review_widget',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackStoryblokEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
