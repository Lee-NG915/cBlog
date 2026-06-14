/**
 * @file klaviyo-events.trigger.ts
 * @description Capture Klaviyo events by client-side code
 * @documentation https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import type { Image } from '@castlery/types';
import type {
  KlaviyoAddedToCartEventSchema,
  KlaviyoAddedToCartTriggerPayloadSchema,
  KlaviyoAddedToCartTriggerPayloadSchemaV2,
  KlaviyoIdentifyEventSchema,
  KlaviyoIdentifyTriggerPayloadSchema,
  KlaviyoRecentlyViewedItemsEventSchema,
  KlaviyoStartedCheckoutEventSchema,
  KlaviyoStartedCheckoutTriggerPayloadSchema,
  KlaviyoViewedProductEventSchema,
} from '../entity';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildKlaviyoItem,
  buildKlaviyoItemV2,
  compactCategories,
  isTrackableLineItem,
  isTrackableLineItemV2,
  logKlaviyoError,
  logKlaviyoInfo,
  logKlaviyoWarn,
  toKlaviyoMoney,
  TRACKING_MSGS_MAP,
  getBreadcrumbNames,
  getProductImageUrl,
  getProductUrl,
} from '../helpers';
import { trackingFeatureService } from '../helpers/feature.helper';
import { trackKlaviyo } from '../utils';

/**
 * KL event : identify
 */
export const trackKlaviyoIdentifyEvent = createAsyncThunk(
  'tracking/trackKlaviyoIdentifyEvent',
  async (payload: KlaviyoIdentifyTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.email) {
      logKlaviyoWarn('identify', 'customer email is not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const eventPayload: KlaviyoIdentifyEventSchema = {
        $email: payload.email,
        $first_name: payload.firstname,
        $last_name: payload.lastname,
      };

      trackKlaviyo(EVENTS_NAMES_MAP.KL_IDENTIFY, eventPayload);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logKlaviyoError('identify', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * KL event : Viewed Product
 */
export const trackKlaviyoViewedProductEvent = createAsyncThunk(
  'tracking/trackKlaviyoViewedProductEvent',
  async (_, { getState, fulfillWithValue }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootState = getState() as any;
    const product = selectProduct(rootState);
    const variant = selectVariant(rootState);
    if (!product || !variant) {
      logKlaviyoWarn('viewed_product', 'product or variant is not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const [pageName, subPageName] = getBreadcrumbNames(product.taxons);
      const params: KlaviyoViewedProductEventSchema = {
        ProductName: variant.product_name,
        ProductID: variant.id,
        SKU: variant.sku,
        Categories: compactCategories([pageName, subPageName]),
        ImageURL: getProductImageUrl(variant.images as Image[]),
        URL: getProductUrl(variant as any, product.slug),
        Brand: 'Castlery',
        Price: +variant.price,
        CompareAtPrice: +variant.list_price,
      };

      trackKlaviyo(EVENTS_NAMES_MAP.KL_VIEWED_PRODUCT, params);
      if (trackingFeatureService.enabledTrackKlaviyoRecentlyViewedItems) {
        const recentlyViewedPayload: KlaviyoRecentlyViewedItemsEventSchema = {
          Title: params.ProductName,
          ItemId: params.ProductID,
          Categories: params.Categories,
          ImageUrl: params.ImageURL,
          Url: params.URL,
          Metadata: {
            Brand: params.Brand,
            Price: params.Price,
            CompareAtPrice: params.CompareAtPrice,
          },
        };

        trackKlaviyo(EVENTS_NAMES_MAP.KL_RECENTLY_VIEWED_ITEMS, recentlyViewedPayload);
      }

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logKlaviyoError('viewed_product', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * KL event : Added to Cart
 * @description ORP only. Uses the ORP `LineItemSchema` cart payload.
 */
export const trackKlaviyoAddedToCartEventV2 = createAsyncThunk(
  'tracking/trackKlaviyoAddedToCartEventV2',
  async (payload: KlaviyoAddedToCartTriggerPayloadSchemaV2, { fulfillWithValue }) => {
    const { cartLineItems, targetLineItem, cartItemTotal } = payload;
    if (!cartLineItems || !targetLineItem) {
      logKlaviyoWarn('added_to_cart', 'cartLineItems or targetLineItem not found', { source: 'orp' });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    if (!isTrackableLineItemV2(targetLineItem)) {
      logKlaviyoWarn('added_to_cart', 'targetLineItem is not trackable', {
        source: 'orp',
        targetLineItemId: targetLineItem.id,
      });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const items = cartLineItems.filter(isTrackableLineItemV2).map(buildKlaviyoItemV2);
      if (items.length === 0) {
        logKlaviyoWarn('added_to_cart', 'no trackable cart line items found', { source: 'orp' });
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: KlaviyoAddedToCartEventSchema = {
        $value: Number(cartItemTotal),
        Items: items,
      };
      logKlaviyoInfo('added_to_cart', params);
      trackKlaviyo(EVENTS_NAMES_MAP.KL_ADDED_TO_CART, params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logKlaviyoError('added_to_cart', error, { source: 'orp' });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * KL event : Added to Cart
 */
export const trackKlaviyoAddedToCartEvent = createAsyncThunk(
  'tracking/trackKlaviyoAddedToCartEvent',
  async (payload: KlaviyoAddedToCartTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload) {
      logKlaviyoWarn('added_to_cart', 'payload is not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const { targetVariantSku } = payload;

    const targetItem = payload.cartLineItems.find((item) => item.variant.sku === targetVariantSku);
    if (!targetItem) {
      logKlaviyoWarn('added_to_cart', 'targetItem not found', { targetVariantSku });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    if (!isTrackableLineItem(targetItem)) {
      logKlaviyoWarn('added_to_cart', 'targetItem is not trackable', { targetVariantSku });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const items = payload.cartLineItems.filter(isTrackableLineItem).map(buildKlaviyoItem);
      if (items.length === 0) {
        logKlaviyoWarn('added_to_cart', 'no trackable cart line items found');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: KlaviyoAddedToCartEventSchema = {
        $value: Number(payload.itemTotal),
        Items: items,
      };

      trackKlaviyo(EVENTS_NAMES_MAP.KL_ADDED_TO_CART, params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logKlaviyoError('added_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * KL event : Started Checkout
 */
export const trackKlaviyoStartedCheckoutEvent = createAsyncThunk(
  'tracking/trackKlaviyoStartedCheckoutEvent',
  async (payload: KlaviyoStartedCheckoutTriggerPayloadSchema, { fulfillWithValue }) => {
    const { lineItems, itemTotal } = payload;
    if (!lineItems) {
      logKlaviyoWarn('started_checkout', 'lineItems not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const items = lineItems.filter(isTrackableLineItemV2).map(buildKlaviyoItemV2);
      if (items.length === 0) {
        logKlaviyoWarn('started_checkout', 'no trackable line items found');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const eventPayload: KlaviyoStartedCheckoutEventSchema = {
        $value: Number(itemTotal),
        Items: items,
      };

      logKlaviyoInfo('started_checkout', eventPayload);
      trackKlaviyo(EVENTS_NAMES_MAP.KL_STARTED_CHECKOUT, eventPayload);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logKlaviyoError('started_checkout', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
