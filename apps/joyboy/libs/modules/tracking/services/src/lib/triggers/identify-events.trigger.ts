import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { gaTrack, getEventRandomId } from '../utils';
import { trackFacebookCompleteRegistrationEvent } from './fb-capi-events.trigger';
import { trackPinterestSignupEvent } from './pinterest-capi-events.trigger';
import { trackDYSignupEvent, trackDYLoginEvent } from './dy-events.trigger';
import { TRACKING_MSGS_MAP } from '../helpers';
import { trackKlaviyoIdentifyEvent } from './klaviyo-events.trigger';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { EVENTS_NAMES_MAP } from '../events-name';

// 旧方法
export const trackUserIdentify = createAsyncThunk('tracking/trackUserIdentify', (_, { getState, rejectWithValue }) => {
  const rootState = getState() as any;
  const customer = selectedActiveUser(rootState);
  if (!customer?.email) {
    return Promise.resolve();
  }
  try {
    dt.track(EventsNames.EVENT_IDENTIFY_USER)({
      customer: customer,
    });
    return Promise.resolve();
  } catch (e) {
    return rejectWithValue(e);
  }
});

/**
 * @description track customer identify event
 * @scenario 1. Triggered when a user is signed up
 * @scenario 2. Triggered when a user is signed in
 */
export const trackCustomerIdentifyEvent = createAsyncThunk(
  'tracking/trackCustomerIdentifyEvent',
  async (payload: { isSignup: boolean; isSignin: boolean }, { dispatch, getState, fulfillWithValue, extra }) => {
    const rootState = getState() as any;
    const { persistenceHandles } = extra as ExtraArgument;
    // @jasper 如果是在登录完成后，用户信息已更新完毕时，调用该方法，可以直接从state取customer，否则，请通过payload传入customer
    // 建议在user listener调用该方法，确保用户信息变动时，会重新追踪
    const customer = selectedActiveUser(rootState);
    if (!customer?.email || !customer?.id) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const eventId = payload.isSignup ? getEventRandomId('Registration') : '';
      const method = persistenceHandles.webAccountChannel.getItem() || '';
      if (method && payload.isSignup) {
        gaTrack({
          event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
          ...(eventId && { eventId }),
          'eventDetails.category': 'Account',
          'eventDetails.action': 'User Registration',
          'eventDetails.label': customer?.id,
          'eventDetails.method': method,
        });
      }
      if (payload.isSignup) {
        // 1. track facebook event
        await dispatch(trackFacebookCompleteRegistrationEvent({ eventId }));
        // 2. track pinterest event
        await dispatch(trackPinterestSignupEvent({ eventId }));
        // 3. track dy event
        await dispatch(trackDYSignupEvent({ email: customer.email, id: customer.id.toString() }));
      }
      if (payload.isSignin) {
        // 4. track dy event
        await dispatch(trackDYLoginEvent({ email: customer.email, id: customer.id.toString() }));
      }
      // 5. track klaviyo event
      await dispatch(
        trackKlaviyoIdentifyEvent({
          email: customer.email,
          firstname: customer.firstname,
          lastname: customer.lastname,
        })
      );

      // persistenceHandles.webAccountChannel.removeItem();
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
