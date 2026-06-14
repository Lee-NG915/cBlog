import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { RootState } from '@castlery/shared-redux-store';
import { gaTrack } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';

/**
 * Track GA identify event for customer login / signup
 *
 * Reads customer from Redux state (selectedActiveUser) internally.
 *
 * @scenario Triggered after user signs in or signs up
 *
 * @param isSignin - Whether this is a sign-in action
 * @param isSignup - Whether this is a sign-up action
 */
export const trackCustomerIdentifyGAEvent = createAsyncThunk(
  'tracking/trackCustomerIdentifyGAEvent',
  ({ isSignin, isSignup }: { isSignin: boolean; isSignup: boolean }, { getState }) => {
    const rootState = getState() as RootState;
    const customer = selectedActiveUser(rootState);

    gaTrack({
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
      'eventDetails.category': 'Account',
      'eventDetails.action': 'identify',
      'eventDetails.label': customer?.id,
      'eventDetails.method': isSignin || isSignup ? 'log in' : 'signed in',
      'eventDetails.dimension5': customer?.email,
      'eventDetails.dimension6': customer?.firstname || '',
      'eventDetails.dimension7': customer?.lastname || '',
    });
  }
);
