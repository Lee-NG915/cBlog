import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack, getEventRandomId } from '../utils';
import { INTL_CURRENCY } from '@castlery/config';
import { TRACKING_MSGS_MAP } from '../helpers';
import { trackPinterestAddToWishlistEvent } from './pinterest-capi-events.trigger';
import { trackFacebookAddToWishlistEvent } from './fb-capi-events.trigger';
import { trackDYAddToWishlistEvent } from './dy-events.trigger';
import { logger } from '@castlery/observability/client';

/**
 * @description
 * @note GA event : trackEvent (add to wishlist)
 * @scenario 1. Triggered when a customer clicks the 'Add to Wishlist' button on the PDP page => action is 'add_to_wishlist'
 */
export const trackAddToWishlistEvent = createAsyncThunk(
  'tracking/trackAddToWishlistEvent',
  async (
    payload: {
      variant: {
        name: string;
        sku: string;
        price: string;
      };
    },
    { dispatch, fulfillWithValue }
  ) => {
    if (!payload.variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_ADD_TO_WISHLIST);
      // 1. trigger facebook add to wishlist event
      await dispatch(trackFacebookAddToWishlistEvent({ eventId, variant: payload.variant }));
      // 2. trigger pinterest add to wishlist event
      await dispatch(trackPinterestAddToWishlistEvent({ eventId, variant: payload.variant }));
      // 3. trigger ga add to wishlist event
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        eventId,
        'eventDetails.category': 'Ecommerce',
        'eventDetails.action': 'Wish-list',
        'eventDetails.label': `${payload.variant.sku} | ${payload.variant.name}`,
        currencyCode: INTL_CURRENCY,
        productName: payload.variant.name,
        productPrice: +payload.variant.price,
        productCode: [payload.variant.sku],
      };
      gaTrack(params);
      // 4. trigger dy add to wishlist event
      await dispatch(trackDYAddToWishlistEvent({ variant: payload.variant }));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackAddToWishlistEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
