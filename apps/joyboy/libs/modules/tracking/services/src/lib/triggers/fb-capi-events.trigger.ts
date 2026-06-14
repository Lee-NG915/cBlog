import { createAsyncThunk } from '@reduxjs/toolkit';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import type {
  FacebookAddPaymentInfoTriggerPayloadSchema,
  FacebookAddSwatchToCartTriggerPayloadSchema,
  FacebookAddToCartTriggerPayloadSchema,
  FacebookAddToWishlistTriggerPayloadSchema,
  FacebookEventIdTriggerPayloadSchema,
  FacebookInitiateCheckoutTriggerPayloadSchema,
  FacebookNewCustomerPurchaseTriggerPayloadSchema,
  FacebookPurchaseTriggerPayloadSchema,
  FacebookSwatchPurchaseTriggerPayloadSchema,
  FacebookViewContentTriggerPayloadSchema,
} from '../entity';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildFacebookAddPaymentInfoCustomData,
  buildFacebookInitiateCheckoutCustomData,
  buildFacebookNewCustomerPurchaseCustomData,
  buildFacebookProductCustomData,
  buildFacebookPurchaseCustomData,
  buildFacebookRegistrationCustomData,
  buildFacebookSwatchAddToCartCustomData,
  buildFacebookSwatchPurchaseCustomData,
  buildFacebookWishlistCustomData,
  logFacebookCapiError,
  logFacebookCapiInfo,
  logFacebookCapiWarn,
  TRACKING_MSGS_MAP,
  trackingFeatureService,
} from '../helpers';
import { fbConversionTrack, getEventRandomId } from '../utils';
import { INTL_CURRENCY } from '@castlery/config';

/**
 * @description 跟踪facebook view content事件
 * @scenario 用户进入 PDP 页面时触发，上报商品浏览行为用于 FB 广告归因与再营销
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （ViewContent）
 */
export const trackFacebookViewContentEvent = createAsyncThunk(
  'tracking/trackFbCapiViewContent',
  async (payload: FacebookViewContentTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.originalPrice || !payload.variant || !payload.eventId) {
      logFacebookCapiWarn('view_content', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_VIEW_CONTENT,
        eventId: payload.eventId,
        customData: buildFacebookProductCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('view_content', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook add to cart事件
 * @scenario 用户在 PDP 点击"Add to Cart"成功后触发，上报加购行为用于 FB 广告优化
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （AddToCart）
 * @remark for all order version
 */
export const trackFacebookAddToCartEvent = createAsyncThunk(
  'tracking/trackFbCapiAddToCart',
  async (payload: FacebookAddToCartTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.variant || !payload.originalPrice || !payload.eventId) {
      logFacebookCapiWarn('add_to_cart', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_ADD_TO_CART,
        eventId: payload.eventId,
        customData: buildFacebookProductCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('add_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook add swatch to cart事件（custom event）
 * @scenario 用户点击"Add Swatch to Cart"成功后触发，区分 swatch 加购行为与普通商品加购
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events （custom event）
 */
export const trackFacebookAddSwatchToCartEvent = createAsyncThunk(
  'tracking/trackFbCapiAddSwatchToCart',
  async (payload: FacebookAddSwatchToCartTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.variant || !payload.swatchRelatedProductId || !payload.eventId) {
      logFacebookCapiWarn('add_swatch_to_cart', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_ATC,
        eventId: payload.eventId,
        customData: buildFacebookSwatchAddToCartCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('add_swatch_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook add to wishlist事件
 * @scenario 用户在 PDP 点击"Add to Wishlist"后触发，上报收藏行为用于 FB 广告再营销
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （AddToWishlist）
 */
export const trackFacebookAddToWishlistEvent = createAsyncThunk(
  'tracking/trackFbCapiAddToWishlist',
  async (payload: FacebookAddToWishlistTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.variant) {
      logFacebookCapiWarn('add_to_wishlist', 'variant is not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_ADD_TO_WISHLIST,
        eventId: payload.eventId,
        customData: buildFacebookWishlistCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('add_to_wishlist', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook 单 session 浏览超过 3 个商品详情页事件（custom event）
 * @scenario 用户在同一 session 内浏览第 3 个 PDP 时触发（feature flag 控制），用于识别高意向用户
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events （custom event）
 */
export const trackFacebookProductViewMoreThan3Event = createAsyncThunk(
  'tracking/trackFbCapiProductViewMoreThan3',
  async (_, { fulfillWithValue, dispatch, extra }) => {
    if (!trackingFeatureService.enabledTrackProductPageViewMoreThan3) {
      logFacebookCapiInfo('product_view_more_than_3', { reason: 'feature flag disabled' });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    }
    try {
      const { persistenceHandles } = extra as ExtraArgument;
      const productPageCount = persistenceHandles.pdpViewedCountPerSession.getItem();
      const viewedCount = productPageCount ? Number(productPageCount) : 0;
      if (viewedCount === 3) {
        const params = {
          eventName: EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_PRODUCT_PAGE_VIEW_MORE_THAN_3,
          eventId: getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_PRODUCT_PAGE_VIEW_MORE_THAN_3),
          customData: {},
        };
        await dispatch(fbConversionTrack(params));
      }
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('product_view_more_than_3', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook complete registration事件
 * @scenario 用户完成账号注册后触发，上报注册行为用于 FB 广告归因
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （CompleteRegistration）
 */
export const trackFacebookCompleteRegistrationEvent = createAsyncThunk(
  'tracking/trackFbCapiCompleteRegistration',
  async (payload: FacebookEventIdTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_COMPLETE_REGISTRATION,
        eventId: payload.eventId,
        customData: buildFacebookRegistrationCustomData('Sign Up'),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('complete_registration', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook newsletter subscription事件
 * @scenario 用户通过 Footer 完成邮件订阅后触发，复用 CompleteRegistration 事件，以 content_name 区分来源
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （CompleteRegistration）
 */
export const trackFacebookNewsletterSubscriptionEvent = createAsyncThunk(
  'tracking/trackFbCapiNewsletterSubscription',
  async (payload: FacebookEventIdTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_COMPLETE_REGISTRATION,
        eventId: payload.eventId,
        customData: buildFacebookRegistrationCustomData('Subscription Footer'),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('newsletter_subscription', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook act with signup事件（custom event）
 * @scenario 用户完成注册后执行了首次业务操作（如加购、收藏）时触发，用于衡量注册用户的转化质量
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events （custom event）
 */
export const trackFacebookActWithSignupEvent = createAsyncThunk(
  'tracking/trackFbCapiActWithSignup',
  async (_, { fulfillWithValue, dispatch }) => {
    try {
      const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_ACT_WITH_SIGNUP);
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_ACT_WITH_SIGNUP,
        eventId,
        customData: {},
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('act_with_signup', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook initiate checkout事件
 * @scenario 用户从购物车进入 checkout 页面时触发，标记结账漏斗起点，用于漏斗分析与广告优化
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （InitiateCheckout）
 * @review payload.contentIds — 确认传 SKU 数组还是 product ID 数组
 * @review payload.numItems — 确认是否需要（FB 标准字段，非必填）
 */
export const trackFacebookInitiateCheckoutEvent = createAsyncThunk(
  'tracking/trackFbCapiInitiateCheckout',
  async (payload: FacebookInitiateCheckoutTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    const { itemTotal, lineItems, eventId } = payload;
    if (!itemTotal || !Array.isArray(lineItems)) {
      logFacebookCapiWarn('initiate_checkout', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    const _eventId = eventId ?? getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_INITIATE_CHECKOUT);

    try {
      const eventPayload = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_INITIATE_CHECKOUT,
        eventId: _eventId,
        customData: buildFacebookInitiateCheckoutCustomData(payload),
      };
      await dispatch(fbConversionTrack(eventPayload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('initiate_checkout', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook add payment info事件
 * @scenario 用户在 checkout 页面选择并提交支付方式时触发，标记支付意向，用于广告归因
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （AddPaymentInfo）
 * @review payload.contentIds — 确认是否需要（非 FB 标准必填字段）
 * @review payload.value — 确认传 cart total 还是 order total
 */
export const trackFacebookAddPaymentInfoEvent = createAsyncThunk(
  'tracking/trackFbCapiAddPaymentInfo',
  async (payload: FacebookAddPaymentInfoTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.contentIds?.length) {
      logFacebookCapiWarn('add_payment_info', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_ADD_PAYMENT_INFO,
        eventId: payload.eventId,
        customData: buildFacebookAddPaymentInfoCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('add_payment_info', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook purchase事件
 * @scenario 订单支付成功后，在 order confirmation 页面触发，上报购买行为用于 FB 广告归因与 ROAS 统计
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events （Purchase）
 * @review customData.order_id — 确认后端 CAPI 映射字段名是否一致
 * @review customData.content_type — 确认是否需要加 'product'
 * @review payload.contentIds — 确认传 SKU 数组还是 product ID 数组
 */
export const trackFacebookPurchaseEvent = createAsyncThunk(
  'tracking/trackFbCapiPurchase',
  async (payload: FacebookPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.orderId) {
      logFacebookCapiWarn('purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_PURCHASE,
        eventId: payload.eventId,
        customData: buildFacebookPurchaseCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook swatch purchase事件（custom event）
 * @scenario 订单支付成功后，在 order confirmation 页面触发，仅当订单包含 swatch 商品时上报，用于区分 swatch 购买行为
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events （custom event）
 * @review customData — 确认是否需要加 value / currency（swatch 通常免费，待确认）
 * @review payload.swatchSkus — 确认字段来源（order line_items 中 is_swatch 的 variant.sku）
 */
export const trackFacebookSwatchPurchaseEvent = createAsyncThunk(
  'tracking/trackFbCapiSwatchPurchase',
  async (payload: FacebookSwatchPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.swatchSkus?.length) {
      logFacebookCapiWarn('swatch_purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_PURCHASE,
        eventId: payload.eventId,
        customData: buildFacebookSwatchPurchaseCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('swatch_purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 跟踪facebook new customer purchase事件（custom event）
 * @scenario 订单支付成功后，在 order confirmation 页面触发，仅当用户为新客时上报，用于新客获取广告的转化归因与优化
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events （custom event）
 * @review customData.order_id — 确认后端 CAPI 映射字段名
 * @review payload.value — 确认传 order total 还是 subtotal
 */
export const trackFacebookNewCustomerPurchaseEvent = createAsyncThunk(
  'tracking/trackFbCapiNewCustomerPurchase',
  async (payload: FacebookNewCustomerPurchaseTriggerPayloadSchema, { fulfillWithValue, dispatch }) => {
    if (!payload.eventId || !payload.value || !payload.orderId) {
      logFacebookCapiWarn('new_customer_purchase', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const params = {
        eventName: EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_NEW_CUSTOMER_PURCHASE,
        eventId: payload.eventId,
        customData: buildFacebookNewCustomerPurchaseCustomData(payload),
      };
      await dispatch(fbConversionTrack(params));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logFacebookCapiError('new_customer_purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
