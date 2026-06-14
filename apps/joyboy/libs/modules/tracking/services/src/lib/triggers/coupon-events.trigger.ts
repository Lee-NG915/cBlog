import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import { TRACKING_MSGS_MAP } from '../helpers';
import { logger } from '@castlery/observability';
import type {
  AppliedCouponTriggerPayloadSchema,
  CampaignProgressBarLinkClickTriggerPayloadSchema,
  ChooseFreeGiftTriggerPayloadSchema,
  ClickRedeemableVoucherTriggerPayloadSchema,
  GAAppliedCouponEventName,
  GAAppliedCouponEventPayloadSchema,
  GACampaignProgressBarLinkClickEventName,
  GACampaignProgressBarLinkClickEventPayloadSchema,
  GAChooseFreeGiftEventName,
  GAChooseFreeGiftEventPayloadSchema,
  GAClickRedeemableVoucherEventName,
  GAClickRedeemableVoucherEventPayloadSchema,
  GAGwpAddToCartEventName,
  GAGwpAddToCartEventPayloadSchema,
  GwpAddToCartTriggerPayloadSchema,
} from '../entity/ga-events.schema';

/**
 * @description Track GA applied-coupon event 2025-12-03
 * @scenario 用户应用优惠码成功时（cart / checkout 页）触发 GA 自定义事件
 * @note 仅负责 GA 渠道上报；其他渠道（DY 等）由 promotion-tracking.listener 编排
 */
export const trackGAAppliedCouponEvent = createAsyncThunk(
  'tracking/trackGAAppliedCouponEvent',
  async (payload: AppliedCouponTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { couponCode, category } = payload;
      if (!couponCode || !category) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: GAAppliedCouponEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAAppliedCouponEventName,
        'eventDetails.category': category,
        'eventDetails.action': 'add_coupon',
        'eventDetails.label': couponCode,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA applied coupon event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track the GA `click_redeemable_voucher` event.
 * @scenario Driven by `promotion-tracking.listener` from the promotion-domain
 *           `redeemableVoucherClickedEvent`, which fires when the user clicks a
 *           CREDITS row in `<CouponWalletAutocomplete>`'s dropdown (full cart /
 *           mini cart / checkout-shipping-address / checkout-shipping-method /
 *           checkout-payment). The listener passes the credits cost through as
 *           `label`; this trigger does no further mapping.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=coupon_wallet_dropdown_list`,
 *       `eventDetails.action=click_redeemable_voucher`.
 */
export const trackClickRedeemableVoucherEvent = createAsyncThunk(
  'tracking/trackClickRedeemableVoucherEvent',
  async (payload: ClickRedeemableVoucherTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.label) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const params: GAClickRedeemableVoucherEventPayloadSchema = {
      event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAClickRedeemableVoucherEventName,
      'eventDetails.category': 'coupon_wallet_dropdown_list',
      'eventDetails.action': 'click_redeemable_voucher',
      'eventDetails.label': payload.label,
    };
    gaTrack(params);
    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);

/**
 * @description Track the GA `campaign_progress_bar_link_click` event.
 * @scenario Driven by `promotion-tracking.listener` from the promotion-domain
 *           `campaignProgressBarLinkClickedEvent`, which fires when the user
 *           clicks the price-break progress-bar link text. Every click is
 *           tracked; no impression or dedup behavior is attached here.
 * @note GA shape: `event=trackEvent`,
 *       `eventDetails.category=campaign_progress_bar_link_click`,
 *       `eventDetails.action=<campaignName>`,
 *       `eventDetails.method=<discount>`.
 */
export const trackGACampaignProgressBarLinkClickEvent = createAsyncThunk(
  'tracking/trackGACampaignProgressBarLinkClickEvent',
  async (payload: CampaignProgressBarLinkClickTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { campaignName, discount } = payload;
      if (!campaignName || !discount) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: GACampaignProgressBarLinkClickEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GACampaignProgressBarLinkClickEventName,
        'eventDetails.category': 'campaign_progress_bar_link_click',
        'eventDetails.action': campaignName,
        'eventDetails.method': discount,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA campaign progress bar link click event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track the GA `choose_free_gift` event.
 * @scenario Driven by `promotion-tracking.listener` from the promotion-domain
 *           `chooseFreeGiftClickedEvent`, which fires when the user clicks the
 *           Choose your gift entry to expand the gift selection panel. Every
 *           valid expand click is tracked; no page-view or session deduping.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=choose_free_gift`,
 *       `eventDetails.label=<miniCart | fullCart>`.
 */
export const trackGAChooseFreeGiftEvent = createAsyncThunk(
  'tracking/trackGAChooseFreeGiftEvent',
  async (payload: ChooseFreeGiftTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { label } = payload;
      if (!label) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: GAChooseFreeGiftEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAChooseFreeGiftEventName,
        'eventDetails.category': 'choose_free_gift',
        'eventDetails.label': label,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA choose free gift event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track the GA `gwp_add_to_cart` event.
 * @scenario Driven by `cart-tracking.listener` from the cart-domain
 *           `addedGiftActionSucceededEvent`, which fires only after a gift is
 *           successfully added to cart. Every successful add is tracked.
 * @note GA shape: `event=trackEvent`, `eventDetails.category=gwp_add_to_cart`,
 *       `eventDetails.action=<campaignName>`, `eventDetails.label=<surface>`,
 *       `eventDetails.gift_id=<gift sku>`.
 */
export const trackGAGwpAddToCartEvent = createAsyncThunk(
  'tracking/trackGAGwpAddToCartEvent',
  async (payload: GwpAddToCartTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      const { campaignName, label, giftId } = payload;
      if (!campaignName || !label || !giftId) {
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      const params: GAGwpAddToCartEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GAGwpAddToCartEventName,
        'eventDetails.category': 'gwp_add_to_cart',
        'eventDetails.action': campaignName,
        'eventDetails.label': label,
        'eventDetails.gift_id': giftId,
      };
      gaTrack(params);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('Track GA GWP add to cart event failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
