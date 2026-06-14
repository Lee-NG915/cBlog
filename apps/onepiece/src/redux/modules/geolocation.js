/* eslint-disable camelcase */
import { defaultCity } from 'config';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {
  getCityFromCookie,
  initFreeShipping,
  set as setCookieCity,
  getLocationFromRegionId,
  setIpAddress,
} from 'utils/shippingLocation';
import { capitalize } from 'utils/string';
import { init as initTrackingLocation } from 'utils/trackingLocation';

let getNamespace;
if (__SERVER__) {
  getNamespace = require('cls-hooked').getNamespace;
}

const LOAD_SUCCESS = 'geolocation/LOAD_SUCCESS';
const UPDATE_SHIPPING_LOCATION = 'geolocation/UPDATE_SHIPPING_LOCATION';
const UPDATE_PREV_CORRECT_SHIPPING_LOCATION = 'geolocation/UPDATE_PREV_CORRECT_SHIPPING_LOCATION';

/**
 * @typedef {Object} shippingLocation
 * @property {String} zipcode
 * @property {String} city
 * @property {String} state
 * @property {String} inventoryRegionCode "us-west" 10001 || "us-east" 90024
 */

/**
 * @param {*} state
 * @return {shippingLocation} shippingLocation
 */
export const selectedShippingLocation = (state) => {
  let res;
  const locationFromRedux = state?.geolocation?.shippingLocation;
  if (!isEmpty(locationFromRedux)) {
    res = locationFromRedux;
  } else {
    // TODO In CSR mode, initShippingLocation is not call
    // resulting in an update of the selectedShippingLocation reference obtained
    const locationFromCookie = getCityFromCookie();
    if (!isEmpty(locationFromCookie)) {
      res = locationFromCookie;
    }
  }
  res = res || defaultCity;
  res.city = capitalize(res?.city);
  return res;
};
export const selectedPrevCorrectShippingLocation = (state) => {
  const res = state?.geolocation?.prevCorrectShippingLocation;
  return res || defaultCity;
};

const initialState = {
  // data: {
  //  ip_address: '127.0.0.1',
  //  city: undefined,
  //  country_code: undefined,
  //  zip_code: undefined,
  //  region_code: undefined
  // },
  shippingLocation: {
    // city,
    // zipcode,
    // state,
  },
  // prevCorrectShippingLocation: {
  //  city,
  //  zipcode,
  //  state,
  // },
};
export default function geolocation(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_SUCCESS:
      return {
        ...state,
        data: action.payload,
      };
    case UPDATE_SHIPPING_LOCATION:
      return {
        ...state,
        shippingLocation: action.payload,
      };
    case UPDATE_PREV_CORRECT_SHIPPING_LOCATION: {
      return {
        ...state,
        /**
         * Remember here that you cannot use
         * prevCorrectShippingLocation : {
         *  ...prevCorrectShippingLocation,
         *  action.payload
         * }
         *  Please check the specific reasons quickshipswitch.js
         */
        prevCorrectShippingLocation: action.payload,
      };
    }
    default:
      return state;
  }
}

function setLocation(data) {
  return {
    type: LOAD_SUCCESS,
    payload: data,
  };
}
export function updateShippingLocation(data) {
  return {
    type: UPDATE_SHIPPING_LOCATION,
    payload: data,
  };
}

function updatePrevCorrectShippingLocation(data) {
  return {
    type: UPDATE_PREV_CORRECT_SHIPPING_LOCATION,
    payload: data,
  };
}

/**
 * !importance
 */
export const pleaseCallAfterUpdateValitedShippingLocation = () => (dispatch, getState) => {
  dispatch(updatePrevCorrectShippingLocation(selectedShippingLocation(getState())));
};
/**
 * Update the location in redux and cookies
 * @param {*} newLocation
 * @returns
 * @effect modified city cookie
 */
export const handleChangeShippingLocation = (newLocation) => (dispatch, getState) => {
  const currentLocation = selectedShippingLocation(getState());
  if (isEqual(currentLocation, newLocation)) {
    //
    return;
  }
  dispatch(updateShippingLocation(newLocation));
  setCookieCity(newLocation);
};

/**
 * can only be called during application initialization
 * @param {*} data
 * @returns
 */
const initShippingLocation =
  (data = {}) =>
  (dispatch) => {
    const { data: locationFromRegionId } = getLocationFromRegionId(data?.region_id);
    const locationFromCookie = getCityFromCookie();
    const locationFromHeader = {
      city: data.city,
      state: data.region_code,
      zipcode: data.zip_code,
    };
    const location = locationFromRegionId?.zipcode
      ? // 1. region_id
        locationFromRegionId
      : locationFromCookie?.zipcode
      ? // 2.cookie
        locationFromCookie
      : locationFromHeader?.zipcode && data?.country_code === __COUNTRY__
      ? // 3. header
        locationFromHeader
      : // 4 default
        defaultCity;

    dispatch(updateShippingLocation(location));
    setCookieCity(location);
    setIpAddress(data?.ip_address);
    initFreeShipping({ zipcode: location?.zip_code });
  };

export function init() {
  return (dispatch) => {
    if (__SERVER__) {
      // load data from headers
      const request = getNamespace('castlery').get('req');
      const { headers, query = {} } = request;
      // The header information here is added by our gateway (AWS)
      const country_code = headers['x-viewer-country'];
      const city = headers['x-viewer-city'];
      const zip_code = headers['x-viewer-postal-code'];
      const region_code = headers['x-viewer-country-region'];
      const { region_id } = query;

      const data = {
        ip_address: request?.ip || '',
        city,
        country_code,
        zip_code,
        region_code,
        region_id,
      };

      dispatch(setLocation(data));
      dispatch(initShippingLocation(data));
      initTrackingLocation(data);
    }
    return Promise.resolve();
  };
}
