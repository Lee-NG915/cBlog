import { EVENTS_NAMES_MAP, gaTrack, TRACKING_MSGS_MAP } from '@castlery/modules-tracking-services';
import { logger } from '@castlery/observability/client';
import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * @description tracking search suggestion result event
 */
export const trackSuggestionsResultEvent = createAsyncThunk(
  'tracking/trackSuggestionsResultEvent',
  (payload: { searchTerm?: string; suggestionCount?: number }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'search_banner',
        'eventDetails.search_term': payload.searchTerm ?? '',
        'eventDetails.action': 'view_search_suggestions',
        'eventDetails.tag': 'suggestion_count',
        'eventDetails.tag_value': payload.suggestionCount ?? 0,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackSuggestionsResultEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description tracking search suggestion select event
 */
export const trackSuggestionsSelectEvent = createAsyncThunk(
  'tracking/trackSuggestionsSelectEvent',
  (
    payload: { searchTerm?: string; suggestionType?: string; suggestionText?: string; position?: number },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'search_banner',
        'eventDetails.label': payload.suggestionType ?? '',
        'eventDetails.action': 'select_search_suggestion',
        'eventDetails.tag': 'suggestion_text',
        'eventDetails.tag_value': payload.suggestionText ?? '',
        'eventDetails.position': payload.position ?? 0,
        'eventDetails.search_term': payload.searchTerm ?? '',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackSuggestionsSelectEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

export const trackSearchResultsLoadedEvent = createAsyncThunk(
  'tracking/trackSearchResultsLoadedEvent',
  (payload: { searchTerm?: string; suggestionCount?: number }, { fulfillWithValue }) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'search_banner',
        'eventDetails.action': 'search_results_loaded',
        'eventDetails.tag': 'result_count',
        'eventDetails.tag_value': payload.suggestionCount ?? 0,
        'eventDetails.label': payload.suggestionCount && payload.suggestionCount > 0 ? 'regular' : 'zero_result',
        'eventDetails.search_term': payload.searchTerm ?? '',
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackSearchResultsLoadedEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
