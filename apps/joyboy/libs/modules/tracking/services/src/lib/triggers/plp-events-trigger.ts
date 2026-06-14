import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import { INTL_CURRENCY } from '@castlery/config';
import { TRACKING_MSGS_MAP, findBrand, getBreadcrumbNames, getOriginalAmount } from '../helpers';
import { trackDYFilterItemsEvent, trackDYApiRecommendationsEngagementEvent } from './dy-events.trigger';
import { logger } from '@castlery/observability/client';

/**
 * @description track product impression event for PLP page
 * @note GA event : productImpression
 * @scenario 1. Triggered when a user views a product listing page (PLP)
 */
export const trackPLPProductImpressionEvent = createAsyncThunk(
  'tracking/trackPLPProductImpressionEvent',
  async (payload: { list: { product: any; variant: any; page: string }[] }, { fulfillWithValue }) => {
    if (!payload.list) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const impressions = payload.list.map((item) => {
      const { product, variant, page } = item;
      const brand = findBrand(product.taxons);
      const [pageName, subPageName] = getBreadcrumbNames(product.taxons);
      return {
        brand,
        category: subPageName,
        dimension1: pageName,
        id: variant.sku,
        list: page,
        name: variant.name,
        price: variant.price,
        ...(variant?.badges?.length && Array.isArray(variant.badges) && variant.badges.length > 0
          ? {
              tag: 'product_tag',
              tag_value: variant.badges.join(', '),
            }
          : {}),
      };
    });
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_PRODUCT_IMPRESSION,
        ecommerce: {
          currencyCode: INTL_CURRENCY,
          impressions: impressions,
        },
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackPLPProductImpressionEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track product click event for PLP page
 * @note GA event : productClick
 * @note DY event : SLOT_CLICK or CLICK (engagement reporting via trackDYApiRecommendationsEngagementEvent)
 * @scenario 1. Triggered when a user clicks on a product item in product listing page (PLP)
 */
export const trackPLPProductClickEvent = createAsyncThunk(
  'tracking/trackPLPProductClickEvent',
  async (payload: { product: any; variant: any; page: string }, { dispatch, fulfillWithValue }) => {
    if (!payload.product || !payload.variant) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const { product, variant } = payload;
      const brand = findBrand(product.taxons);
      const [pageName, subPageName] = getBreadcrumbNames(product.taxons);

      // 1. GA tracking
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_PRODUCT_CLICK,
        ecommerce: {
          currencyCode: INTL_CURRENCY,
          click: {
            actionField: { list: payload.page ?? '' },
            products: [
              {
                name: variant.name,
                id: variant.sku,
                price: getOriginalAmount(variant.price),
                dimension1: pageName,
                category: subPageName,
                brand,
              },
            ],
          },
        },
      };
      gaTrack(params);

      // 2. DY engagement reporting (SLOT_CLICK or CLICK)
      // Report click engagement to DY if the product has DY tracking metadata
      // This is essential for DY to track the effectiveness of PLP Ranking campaigns
      if (product.dyTracking?.slotId) {
        await dispatch(trackDYApiRecommendationsEngagementEvent({ slotId: product.dyTracking.slotId }));
      }

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('track product click event failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description track product listings filter event for PLP page
 * @note GA event : track_event
 * @scenario 1. Triggered when a user filters products on product listing page (PLP)
 */
export const trackProductListingsFilterEvent = createAsyncThunk(
  'tracking/trackProductListingsFilterEvent',
  async (payload: { action: string; label: string }, { dispatch, fulfillWithValue }) => {
    try {
      const { action, label } = payload;
      if (!action) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      // 1. trigger ga filter event
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'Product Listings',
        'eventDetails.action': action,
        'eventDetails.label': label ?? '',
      };
      gaTrack(params);
      // 2. trigger dy filter event
      await dispatch(trackDYFilterItemsEvent({ type: action, value: label }));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackPLPFilterEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
