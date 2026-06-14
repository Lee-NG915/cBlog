'use client';
import { getUserCity, getGaPerSudoId } from './base.util';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { pinterestConversion } from '@castlery/modules-tracking-domain';
import { TRACKING_MSGS_MAP } from '../helpers';
import { logger } from '@castlery/observability/client';
import { checkConsentGranted, CookieYesConsentCategories } from '@castlery/shared-privacy-kit';

const PINTEREST_CONVERSION_TRACK_CONSENT_CATEGORIES: CookieYesConsentCategories[] = ['advertisement', 'analytics'];

export function getPinterestUserData() {
  const userCity = getUserCity();
  const gaPerSudoId = getGaPerSudoId();
  const ct = userCity?.city?.toLowerCase();
  const st = userCity?.region_code?.toLowerCase();
  const zp = userCity?.zip_code ?? undefined;
  const country = userCity?.country_code?.toLowerCase();

  return {
    // em: data.user_data.em && [encHex.stringify(sha256(data.user_data.em))],
    client_ip_address: userCity?.ip_address,
    client_user_agent: navigator?.userAgent,
    ct: ct && [encHex.stringify(sha256(ct))],
    st: st && [encHex.stringify(sha256(st))],
    zp: zp && [encHex.stringify(sha256(zp))],
    country: country && [encHex.stringify(sha256(country))],
    external_id: gaPerSudoId && [encHex.stringify(sha256(gaPerSudoId.slice(6) || ''))],
  };
}

export function getPinterestCapiEventData({
  eventName,
  eventId,
  customData,
}: {
  eventName: string;
  customData: any;
  eventId: string;
}) {
  const userData = getPinterestUserData();
  const eventTime = Math.floor(Date.now() / 1000);

  const customContents = customData.contents?.map((content: any) => {
    return {
      item_price: content.item_price,
      quantity: content.quantity,
    };
  });

  const reCustomData = {
    value: customData.value ? `${customData.value}` : undefined,
    currency: customData.currency ? `${customData.currency}` : undefined,
    content_ids: customData.content_ids,
    contents: customContents,
    num_items: customData.num_items,
    order_id: customData.order_id,
    search_string: customData.search_string,
  };

  return {
    event_name: eventName || 'custom',
    event_id: eventId,
    event_time: eventTime,
    event_source_url: window?.location?.href,
    custom_data: reCustomData,
    user_data: userData,
    action_source: 'web',
  };
}

export const pinterestConversionTrack = createAsyncThunk(
  'tracking/pinterestConversionTrack',
  async (payload: Parameters<typeof getPinterestCapiEventData>[0], { dispatch, fulfillWithValue }) => {
    if (!checkConsentGranted(PINTEREST_CONVERSION_TRACK_CONSENT_CATEGORIES)) {
      logger.info('pinterestConversionTrack consent not granted ', {
        categories: PINTEREST_CONVERSION_TRACK_CONSENT_CATEGORIES,
      });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const pinterestCapiEventData = getPinterestCapiEventData(payload);
      const params = {
        data: pinterestCapiEventData,
      };
      await dispatch(pinterestConversion.initiate(params)).unwrap();
      // todo @abby 2025-08-27
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('pinterestConversionTrack failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
