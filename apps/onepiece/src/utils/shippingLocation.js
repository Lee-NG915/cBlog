import { get as getCookie, set as setCookie } from 'helpers/Cookie';
import { defaultCity, regionIdMap, enabledFreeshippingCookieForDY, locationFormat } from 'config';

export function set(city) {
  setCookie('city', JSON.stringify(city));
}

export function setIpAddress(ipAddress) {
  setCookie('ip_address', ipAddress);
}

export function setDefault() {
  set(defaultCity);
}

export function getDefault() {
  return defaultCity;
}

/**
 * for dy
 * @param {} param0
 * @returns {void}
 * @effect the "castlery_is_free_shipping" cookie.
 */
export function initFreeShipping({ zipcode }) {
  if (!(__SERVER__ && enabledFreeshippingCookieForDY)) return;
  if (!__FREE_SHIPPING_ZIPCODES__) return;
  if (__FREE_SHIPPING_ZIPCODES__.find((code) => code === zipcode)) {
    setCookie('castlery_is_free_shipping', true);
  }
}

export function get() {
  const city = getCookie('city');
  if (city && city !== 'undefined' && city !== 'null') {
    return JSON.parse(getCookie('city')) || {};
  }
  return defaultCity;
}

export const getCityFromCookie = () => {
  let res;
  try {
    const city = getCookie('city');
    res = city && city !== 'undefined' && city !== 'null' ? JSON.parse(city) : null;
  } catch (e) {
    console.log(`==============>e`);
    console.log(e);
  }
  return res;
};

export function getLocationPresentation(city) {
  if (!locationFormat) return '';
  return locationFormat
    .replace('{{city}}', city.city)
    .replace('{{zipcode}}', city.zipcode)
    .replace('{{state}}', city.state);
}

export function getLocationFromRegionId(regionId) {
  const res = { error: null, data: null };
  let data;
  try {
    const [, location] = Object.entries(regionIdMap).find(([key]) => key === regionId);
    data = location;
    if (!data) {
      throw new Error('error regionId', regionId);
    }
  } catch (error) {
    res.error = error;
    res.data = null;
  } finally {
    res.data = data;
  }

  return res;
}
