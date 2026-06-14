/**
 * @file dy-events.trigger.ts
 * @description Capture Dynamic Yield events by client-side code
 * @documentation https://dy.dev/docs/events
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  reportDyApiCustomCodeCampaignEngagement,
  reportDyApiRecommendationsEngagement,
} from '@castlery/modules-dy-domain';
import type {
  DYAddToCartTriggerPayloadSchema,
  DYAddToCartTriggerPayloadSchemaV2,
  DYAddToWishlistTriggerPayloadSchema,
  DYApiCustomCodeCampaignEngagementTriggerPayloadSchema,
  DYApiRecommendationsEngagementTriggerPayloadSchema,
  DYFilterItemsTriggerPayloadSchema,
  DYKeywordSearchTriggerPayloadSchema,
  DYNewsletterSubscriptionTriggerPayloadSchema,
  DYPurchaseTriggerPayloadSchema,
  DYPromoCodeEnteredTriggerPayloadSchema,
  DYRemoveFromCartTriggerPayloadSchema,
  DYSwatchAddToCartTriggerPayloadSchema,
  DYSwatchPurchaseTriggerPayloadSchema,
  DYUserIdentificationTriggerPayloadSchema,
} from '../entity';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildDYAddToCartProperties,
  buildDYAddToCartPropertiesV2,
  buildDYAddToWishlistProperties,
  buildDYFilterItemsProperties,
  buildDYKeywordSearchProperties,
  buildDYNewsletterSubscriptionProperties,
  buildDYPurchaseProperties,
  buildDYPromoCodeEnteredProperties,
  buildDYRemoveFromCartProperties,
  buildDYSwatchAddToCartProperties,
  buildDYSwatchPurchaseProperties,
  buildDYUserIdentificationProperties,
  logDYError,
  logDYWarn,
  TRACKING_MSGS_MAP,
} from '../helpers';
import { trackDy } from '../utils';

/**
 * @description 上报 DY 推荐位互动事件（服务端 API）
 * @scenario DY 推荐位组件曝光或用户点击推荐商品时，由服务端调用 DY API 上报互动数据，不依赖前端 SDK
 * @see https://dy.dev/docs/report-engagement （Report Engagement）
 */
export const trackDYApiRecommendationsEngagementEvent = createAsyncThunk(
  'tracking/trackDYApiRecommendationsEngagementEvent',
  async (payload: DYApiRecommendationsEngagementTriggerPayloadSchema, { dispatch, fulfillWithValue }) => {
    if (!payload.slotId) {
      logDYWarn('api_recommendations_engagement', 'slotId is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      await dispatch(reportDyApiRecommendationsEngagement.initiate({ slotId: payload.slotId }));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('api_recommendations_engagement', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description 上报 DY custom code campaign 互动事件（服务端 API）
 * @scenario DY custom code campaign 有曝光（IMP）或点击（CLICK）行为时触发，由服务端上报，用于 DY 实验数据统计
 * @see https://dy.dev/docs/report-engagement （Report Engagement）
 */
export const trackDYApiCustomCodeCampaignEngagementEvent = createAsyncThunk(
  'tracking/trackDYApiCustomCodeCampaignEngagementEvent',
  async (payload: DYApiCustomCodeCampaignEngagementTriggerPayloadSchema, { dispatch, fulfillWithValue }) => {
    if (!payload.engagementType || !payload.decisionId) {
      logDYWarn('custom_code_campaign_engagement', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      await dispatch(
        reportDyApiCustomCodeCampaignEngagement.initiate({
          engagementType: payload.engagementType,
          decisionId: payload.decisionId,
          variations: payload.variations,
        })
      );
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('custom_code_campaign_engagement', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Swatch Add to Cart Event
 * @scenario 用户在 swatch 弹窗点击"Add to Cart"后触发，区分 swatch 加购行为与普通商品加购（DY custom event）
 * @see https://dy.dev/docs/custom-events （Custom Events）
 */
export const trackDYSwatchAddToCartEvent = createAsyncThunk(
  'tracking/trackDYSwatchAddToCartEvent',
  async (payload: DYSwatchAddToCartTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.variant.name || !payload.variant.sku) {
      logDYWarn('swatch_atc', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_SWATCH_ATC, buildDYSwatchAddToCartProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('swatch_atc', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Add to Cart Event (V1, uses legacy LineItem type)
 * @scenario 用户在 PDP 点击"Add to Cart"成功后触发，上报当前加购商品及完整购物车状态用于 DY 个性化推荐
 * @see https://dy.dev/docs/add-to-cart （Add to Cart）
 */
export const trackDYAddToCartEvent = createAsyncThunk(
  'tracking/trackDYAddToCartEvent',
  async (payload: DYAddToCartTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.cartLineItems || !payload.variant.sku || !payload.variant.name || !payload.variant.quantity) {
      logDYWarn('add_to_cart', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_ADD_TO_CART, buildDYAddToCartProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('add_to_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Add to Cart Event (V2, uses LineItemSchema)
 * @scenario 用户在 PDP 点击"Add to Cart"成功后触发，上报含 value 的加购数据及购物车状态（swatch 商品自动排除）
 * @see https://dy.dev/docs/add-to-cart （Add to Cart）
 */
export const trackDYAddToCartEventV2 = createAsyncThunk(
  'tracking/trackDYAddToCartEventV2',
  async (payload: DYAddToCartTriggerPayloadSchemaV2, { fulfillWithValue }) => {
    const { cartLineItems, targetLineItem } = payload;

    if (!cartLineItems || !targetLineItem) {
      logDYWarn('add_to_cart_v2', 'cartLineItems or targetLineItem not found');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_ADD_TO_CART, buildDYAddToCartPropertiesV2(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('add_to_cart_v2', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Add to Wishlist Event
 * @scenario 用户在 PDP 或 PLP 点击收藏图标时触发，上报商品 SKU 用于 DY 个性化推荐优化
 * @see https://dy.dev/docs/add-to-wishlist （Add to Wishlist）
 */
export const trackDYAddToWishlistEvent = createAsyncThunk(
  'tracking/trackDYAddToWishlistEvent',
  async (payload: DYAddToWishlistTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.variant.sku) {
      logDYWarn('add_to_wishlist', 'variant.sku is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_ADD_TO_WISHLIST, buildDYAddToWishlistProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('add_to_wishlist', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Keyword Search Event
 * @scenario 用户在搜索框输入关键词并触发搜索时上报，用于 DY 基于搜索意图的个性化推荐
 * @see https://dy.dev/docs/keyword-search （Keyword Search）
 */
export const trackDYKeywordSearchEvent = createAsyncThunk(
  'tracking/trackDYKeywordSearchEvent',
  async (payload: DYKeywordSearchTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.keywords) {
      logDYWarn('keyword_search', 'keywords is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_KEYWORD_SEARCH, buildDYKeywordSearchProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('keyword_search', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Filter Items Event
 * @scenario 用户在 PLP 应用筛选条件时触发，上报筛选类型与筛选值用于 DY 个性化分析与推荐优化
 * @see https://dy.dev/docs/filter-items （Filter Items）
 */
export const trackDYFilterItemsEvent = createAsyncThunk(
  'tracking/trackDYFilterItemsEvent',
  async (payload: DYFilterItemsTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.type || !payload.value) {
      logDYWarn('filter_items', 'missing required payload fields');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_FILTER_ITEMS, buildDYFilterItemsProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('filter_items', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Swatch Purchase Event
 * @scenario 订单支付成功后，在 order confirmation 页面触发，仅当订单包含 swatch 商品时上报，上报所有 swatch SKU（DY custom event）
 * @see https://dy.dev/docs/custom-events （Custom Events）
 * @review payload.swatches — 确认字段来源（order line_items 中 is_swatch 的商品）
 * @review 'Swatch SKUs' — 确认 DY custom event 的属性命名是否与 DY 侧配置一致
 */
export const trackDYSwatchPurchaseEvent = createAsyncThunk(
  'tracking/trackDYSwatchPurchaseEvent',
  async (payload: DYSwatchPurchaseTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.swatches.length) {
      logDYWarn('swatch_purchase', 'swatches array is empty');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_SWATCH_PURCHASE, buildDYSwatchPurchaseProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('swatch_purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Purchase Event
 * @scenario 订单支付成功后，在 order confirmation 页面触发，上报购买数据（swatch 商品自动排除），用于 DY 购买归因与推荐优化
 * @see https://dy.dev/docs/purchase （Purchase）
 * @review payload.order — 确认 order refactoring 后数据结构是否变更（当前依赖 selectOrder 的旧版 order 类型）
 * @review order.number — 确认用作 uniqueTransactionId 的字段名在新 order 结构中是否一致
 */
export const trackDYPurchaseEvent = createAsyncThunk(
  'tracking/trackDYPurchaseEvent',
  async (payload: DYPurchaseTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.order) {
      logDYWarn('purchase', 'order is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_PURCHASE, buildDYPurchaseProperties(payload.order));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('purchase', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Remove from Cart Event
 * @scenario 用户在购物车页面移除商品后触发，上报被移除商品信息及剩余购物车状态，用于 DY 个性化推荐重新计算
 * @see https://dy.dev/docs/remove-from-cart （Remove from Cart）
 * @review payload.quantity — 确认移除数量字段来源
 * @review payload.cartLineItems — 确认移除后的剩余购物车数据来源（需排除 swatch 商品）
 */
export const trackDYRemoveFromCartEvent = createAsyncThunk(
  'tracking/trackDYRemoveFromCartEvent',
  async (payload: DYRemoveFromCartTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.variant.sku) {
      logDYWarn('remove_from_cart', 'variant.sku is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    if (!payload.quantity || payload.quantity <= 0) {
      logDYWarn('remove_from_cart', 'quantity must be a positive number');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_REMOVE_FROM_CART, buildDYRemoveFromCartProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('remove_from_cart', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Newsletter Subscription Event
 * @scenario 用户完成邮件订阅后触发，上报哈希后的邮箱用于 DY 用户识别与个性化（仅在浏览器环境且 DYO 可用时执行）
 * @see https://dy.dev/docs/newsletter-subscription （Newsletter Subscription）
 */
export const trackDYNewsletterSubscriptionEvent = createAsyncThunk(
  'tracking/trackDYNewsletterSubscriptionEvent',
  async (payload: DYNewsletterSubscriptionTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const email = payload.email;
      let hashedEmail = '';
      if (typeof window !== 'undefined' && window.DYO) {
        hashedEmail = window.DYO.dyhash.sha256(email.toLowerCase());
      }
      if (hashedEmail) {
        trackDy(EVENTS_NAMES_MAP.DY_NEWSLETTER_SUBSCRIPTION, buildDYNewsletterSubscriptionProperties(hashedEmail));
      }
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('newsletter_subscription', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Signup Event
 * @scenario 用户完成账号注册后触发，以哈希邮箱或 cuid 上报用户身份，用于 DY 跨设备个性化识别
 * @see https://dy.dev/docs/signup （Signup）
 */
export const trackDYSignupEvent = createAsyncThunk(
  'tracking/trackDYSignupEvent',
  async (payload: DYUserIdentificationTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      if (payload.email && typeof window !== 'undefined' && window.DYO) {
        trackDy(
          EVENTS_NAMES_MAP.DY_SIGNUP,
          buildDYUserIdentificationProperties('signup-v1', {
            hashedEmail: window.DYO.dyhash.sha256(payload.email.toLowerCase()),
          })
        );
      } else if (payload.id) {
        trackDy(
          EVENTS_NAMES_MAP.DY_SIGNUP,
          buildDYUserIdentificationProperties('signup-v1', {
            cuid: payload.id,
          })
        );
      }
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('signup', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Login Event
 * @scenario 用户登录后触发，以哈希邮箱或 cuid 上报用户身份，用于 DY 跨设备个性化与用户旅程追踪
 * @see https://dy.dev/docs/login （Login）
 */
export const trackDYLoginEvent = createAsyncThunk(
  'tracking/trackDYLoginEvent',
  async (payload: DYUserIdentificationTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.email && !payload.id) {
      logDYWarn('login', 'email and id are both missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      if (payload.email && typeof window !== 'undefined' && window.DYO) {
        trackDy(
          EVENTS_NAMES_MAP.DY_LOGIN,
          buildDYUserIdentificationProperties('login-v1', {
            hashedEmail: window.DYO.dyhash.sha256(payload.email.toLowerCase()),
          })
        );
      } else if (payload.id) {
        trackDy(
          EVENTS_NAMES_MAP.DY_LOGIN,
          buildDYUserIdentificationProperties('login-v1', {
            cuid: payload.id,
          })
        );
      }
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('login', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track DY Promo Code Entered Event
 * @scenario 用户在 checkout 页面输入并应用优惠码时触发，用于 DY 促销个性化分析
 * @see https://dy.dev/docs/promo-code-entered （Promo Code Entered）
 * @review 触发时机 — 确认是在用户输入后自动触发，还是点击应用按钮后触发
 */
export const trackDYPromoCodeEnteredEvent = createAsyncThunk(
  'tracking/trackDYPromoCodeEnteredEvent',
  async (payload: DYPromoCodeEnteredTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.promoCode) {
      logDYWarn('promo_code_entered', 'promoCode is missing');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      trackDy(EVENTS_NAMES_MAP.DY_PROMO_CODE_ENTERED, buildDYPromoCodeEnteredProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logDYError('promo_code_entered', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

// Set SPA Context
// export function setSPAContext(context: string, countAsPageView = true) {
//   if (countAsPageView !== false) {
//     window.DY?.recommendationContext = context;
//   }
//   // dy('spa', {
//   //   context,
//   //   countAsPageView,
//   // });
//   trackDySpa();
// }
