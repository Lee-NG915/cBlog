import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { getFbUserLoginInfoFromPersistence } from '@castlery/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import { getUserCity, getEventRandomId } from './base.util';
import { facebookConversionV1, facebookConversionV2 } from '@castlery/modules-tracking-domain';
import { EcEnv } from '@castlery/config';
import { TRACKING_MSGS_MAP, trackingFeatureService } from '../helpers';
import { getFbcFromPersistence, ipv4ToIpv6Full } from '@castlery/utils';
import { logger } from '@castlery/observability/client';
import { checkConsentGranted, CookieYesConsentCategories } from '@castlery/shared-privacy-kit';

const FB_CONVERSION_TRACK_CONSENT_CATEGORIES: CookieYesConsentCategories[] = ['advertisement', 'analytics'];

/**
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters/
 * @returns
 */
export function getFbCapiUserData() {
  const userCity = getUserCity();
  const fbLoginInfo = getFbUserLoginInfoFromPersistence();
  const fbp = makePersistenceHandles().fbp.getItem();
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
  // fbc is the facebook click id, it is a 16-character hexadecimal string
  // when the meta pixel(sdk) is loaded, the fbc will be set to the cookie
  // fbclid is also the facebook click id, which is in the url
  const fbc = getFbcFromPersistence();

  let city;
  let ipAddress;
  let countryCode;
  let regionCode;
  let zipCode;

  if (userCity) {
    city = userCity?.city;
    countryCode = userCity?.country_code;
    regionCode = userCity?.region_code;
    zipCode = userCity?.zip_code;
    ipAddress = userCity?.ip_address;
  }

  return {
    fbc: fbc,
    fbp: fbp,
    client_ip_address: ipAddress ? ipv4ToIpv6Full(ipAddress) : undefined,
    client_user_agent: navigator?.userAgent,
    country: countryCode?.toLowerCase(),
    ct: city?.toLowerCase(),
    st: regionCode?.toLowerCase(),
    zp: zipCode ?? undefined,
    ...(fbLoginInfo?.loginId ? { fb_login_id: fbLoginInfo.loginId } : {}),
  };
}

export function getFbCapiEventData({
  eventName,
  eventId,
  customData,
}: {
  eventName: string;
  customData: any;
  eventId?: string;
}) {
  const userData = getFbCapiUserData();
  let id = eventId;
  const eventTime = Math.floor(Date.now() / 1000);
  if (!id) {
    id = getEventRandomId(`${eventName || ''}`);
  }

  const eventData = {
    event_id: id,
    event_name: eventName,
    event_time: eventTime,
    event_source_url: window?.location?.href,
    custom_data: customData,
    action_source: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 'physical_store' : 'website',
    user_data: userData,
  };

  return eventData;
}

export function cryptoUserData(userData: {
  country: string | undefined;
  ct: string | undefined;
  st: string | undefined;
  zp: string | undefined;
  fb_login_id: string | undefined;
}) {
  return {
    ...userData,
    country: userData.country ? encHex.stringify(sha256(`${userData.country}`)) : undefined,
    ct: userData.ct ? encHex.stringify(sha256(`${userData.ct}`)) : undefined,
    st: userData.st ? encHex.stringify(sha256(`${userData.st}`)) : undefined,
    zp: userData.zp ? encHex.stringify(sha256(`${userData.zp}`)) : undefined,
    fb_login_id: userData.fb_login_id ? encHex.stringify(sha256(`${userData.fb_login_id}`)) : undefined,
  };
}

/**
 * 追踪 facebook 事件 Facebook Conversion API v1 和 v2
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking/
 * @param payload 事件参数
 */
export const fbConversionTrack = createAsyncThunk(
  'tracking/fbConversionTrack',
  async (payload: Parameters<typeof getFbCapiEventData>[0], { fulfillWithValue, dispatch }) => {
    if (!checkConsentGranted(FB_CONVERSION_TRACK_CONSENT_CATEGORIES)) {
      logger.info('fbConversionTrack consent not granted ', {
        categories: FB_CONVERSION_TRACK_CONSENT_CATEGORIES,
      });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const fbCapiEventData = getFbCapiEventData(payload);
    try {
      const requests = [dispatch(facebookConversionV1.initiate({ data: fbCapiEventData })).unwrap()];
      const fbCapiPixelId = EcEnv.NEXT_PUBLIC_FB_CAPI_PIXEL_ID;

      if (trackingFeatureService.enabledFacebookCapiV2 && fbCapiPixelId) {
        requests.push(
          dispatch(
            facebookConversionV2.initiate({
              data: {
                ...fbCapiEventData,
                user_data: cryptoUserData(fbCapiEventData.user_data as any),
                custom_data: {
                  ...fbCapiEventData.custom_data,
                  delivery_category: 'home_delivery',
                },
                pixel_id: fbCapiPixelId,
              },
            })
          ).unwrap()
        );
      }

      const results = await Promise.allSettled(requests);
      const hasRejectedRequest = results.some((result) => result.status === 'rejected');

      if (hasRejectedRequest) {
        logger.error('fbConversionTrack failed', { results });
        return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
      }

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('fbConversionTrack failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
