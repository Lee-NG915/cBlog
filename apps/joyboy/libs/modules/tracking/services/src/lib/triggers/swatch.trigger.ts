import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@castlery/shared-redux-store';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack, getEventRandomId } from '../utils';
import { TRACKING_MSGS_MAP } from '../helpers';
import { trackFacebookAddSwatchToCartEvent } from './fb-capi-events.trigger';
import { trackPinterestAddSwatchToCartEvent } from './pinterest-capi-events.trigger';
import { selectProduct } from '@castlery/modules-product-domain';
import { trackDYSwatchAddToCartEvent } from './dy-events.trigger';
import { logger } from '@castlery/observability/client';

/**
 * @description Triggered when a user adds a swatch to the cart.
 * @note 综合事件：GA、FB、Pinterest、DY 触发
 * @scenario 1. This event is triggered when a user adds a swatch to the cart.
 */
export const trackAddSwatchEvent = createAsyncThunk(
  'tracking/trackAddSwatchEvent',
  async (
    payload: {
      sku: string;
      skuName: string;
    },
    { getState, fulfillWithValue, dispatch }
  ) => {
    const { sku, skuName } = payload;
    if (!sku || !skuName) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const rootState = getState() as RootState;
    const product = selectProduct(rootState);

    let swatchRelatedProductId;
    let swatchRelatedProductSlug;
    const currentPathname = window.location.pathname;
    if (currentPathname.includes('/products/') && product && currentPathname.includes(product.slug)) {
      swatchRelatedProductId = product.id;
      swatchRelatedProductSlug = product.slug;
    }
    try {
      const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_ATC);
      // 1. trigger ga add swatch to cart event
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Ecommerce',
        'eventDetails.action': 'Swatch - add to cart',
        'eventDetails.label': `${sku} | ${skuName}`,
      };
      gaTrack(params);
      // 2. trigger facebook add swatch to cart event
      await dispatch(
        trackFacebookAddSwatchToCartEvent({
          eventId,
          variant: { sku: payload.sku, name: payload.skuName },
          swatchRelatedProductId: swatchRelatedProductId,
        })
      );
      // 3. trigger pinterest add swatch to cart event
      await dispatch(
        trackPinterestAddSwatchToCartEvent({
          variant: { sku: payload.sku },
          eventId: eventId,
        })
      );
      // 4. trigger dy add swatch to cart event
      await dispatch(
        trackDYSwatchAddToCartEvent({
          variant: { sku: payload.sku, name: payload.skuName },
          swatchRelatedProductSlug: swatchRelatedProductSlug,
        })
      );

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Tracking add swatch to cart failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
