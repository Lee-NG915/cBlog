/**
 * @file utt-events.trigger.ts
 * @description Capture impact.com UTT (Universal Tracking Tag) events by client-side code
 * @documentation https://integrations.impact.com/impact-brand/docs/javascript-installation
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  UTTConsentTriggerPayloadSchema,
  UTTConversionTriggerPayloadSchema,
  UTTIdentifyTriggerPayloadSchema,
} from '../entity';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildUTTConsentProperties,
  buildUTTConversionProperties,
  buildUTTIdentifyProperties,
  getUTTConversionEventId,
  isUttEnabled,
  logUTTError,
  logUTTWarn,
  logUTTInfo,
  TRACKING_MSGS_MAP,
} from '../helpers';
import { trackUtt } from '../utils';

/**
 * @description Track UTT Consent Event (default + update)
 * @scenario UTT loader 装载前的初始 consent 状态（'default'）以及 CookieYes opt-in/out 变化（'update'）
 * @see https://integrations.impact.com/impact-brand/docs/integrate-consent-mode-on-impactcom
 */
export const trackUTTConsentEvent = createAsyncThunk(
  'tracking/trackUTTConsentEvent',
  async (payload: UTTConsentTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!isUttEnabled()) return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    try {
      trackUtt(EVENTS_NAMES_MAP.UTT_CONSENT, payload.mode, buildUTTConsentProperties(payload));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logUTTError('consent', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track UTT Identify Event
 * @scenario 用户登录/登出/资料变更时，把 customerId + SHA-256(email) 透给 impact.com 做跨设备识别
 * @see https://integrations.impact.com/impact-brand/docs/javascript-installation
 */
export const trackUTTIdentifyEvent = createAsyncThunk(
  'tracking/trackUTTIdentifyEvent',
  async (payload: UTTIdentifyTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!isUttEnabled()) return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    try {
      const properties = buildUTTIdentifyProperties(payload);
      logUTTInfo('identify', 'properties', { properties });
      trackUtt(EVENTS_NAMES_MAP.UTT_IDENTIFY, properties);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logUTTError('identify', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description Track UTT Conversion (Purchase) Event
 * @scenario 订单支付成功后由 purchasedSucceededEvent listener dispatch；上报订单 conversion 数据用于 impact.com partner attribution
 * @see https://integrations.impact.com/impact-brand/docs/javascript-installation
 */
export const trackUTTConversionEvent = createAsyncThunk(
  'tracking/trackUTTConversionEvent',
  async (payload: UTTConversionTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!isUttEnabled()) return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    const eventId = getUTTConversionEventId();
    if (!eventId) {
      logUTTWarn('track_conversion', 'conversionEventId not configured for current market');
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const properties = buildUTTConversionProperties(payload);
      if (!properties) {
        logUTTWarn('track_conversion', 'order has no line items');
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }
      logUTTInfo('track_conversion', 'properties', { properties });
      trackUtt(EVENTS_NAMES_MAP.UTT_TRACK_CONVERSION, eventId, properties, { verifySiteDefinitionMatch: true });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logUTTError('track_conversion', error);
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
