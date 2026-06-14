import { createAsyncThunk } from '@reduxjs/toolkit';
import { TRACKING_MSGS_MAP } from '../helpers';
import { getEventRandomId } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';
import { trackDYNewsletterSubscriptionEvent } from './dy-events.trigger';
import { trackFormSubmitEvent } from './form-events.trigger';
import { RootState } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { trackFacebookNewsletterSubscriptionEvent } from './fb-capi-events.trigger';
import { trackPinterestNewsletterSubscriptionEvent } from './pinterest-capi-events.trigger';

// note： trackSubscription
/**
 * @description track newsletter subscription event
 * @scenario 1. Triggered when a user subscribes to the newsletter on the website footer
 */
export const trackNewsletterSubscriptionEvent = createAsyncThunk(
  'tracking/trackNewsletterSubscriptionEvent',
  async (payload: { subscriptionEmail: string }, { getState, dispatch, fulfillWithValue }) => {
    const rootState = getState() as RootState;
    const customer = selectedActiveUser(rootState);
    const eventId = getEventRandomId('NewsletterSubscription');
    // 1. track ga event (one type of form submit event)
    await dispatch(
      trackFormSubmitEvent({
        action: 'Newsletter Sign-up',
        label: customer?.id?.toString() ?? '',
        method: payload.subscriptionEmail,
        eventId: eventId,
      })
    );
    // 2. track dy event
    if (payload.subscriptionEmail) {
      await dispatch(trackDYNewsletterSubscriptionEvent({ email: payload.subscriptionEmail }));
    }
    // 3. track fb event
    await dispatch(trackFacebookNewsletterSubscriptionEvent({ eventId: eventId }));
    // 4. track pinterest event
    await dispatch(trackPinterestNewsletterSubscriptionEvent({ eventId: eventId }));
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
