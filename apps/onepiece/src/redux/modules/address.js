import { getShippingConfigurations } from 'api/product';
import { updateAddress as updateUserAddress } from 'api/address';

const LOAD = 'address/LOAD';
const LOAD_SUCCESS = 'address/LOAD_SUCCESS';
const LOAD_FAIL = 'address/LOAD_FAIL';
const PROCESS = 'address/PROCESS';
const PROCESS_SUCCESS = 'address/PROCESS_SUCCESS';
const PROCESS_FAIL = 'address/PROCESS_FAIL';

const initialState = {
  loaded: false,
  loading: true,
  processing: false,
  data: [],
};

export default function address(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
      };
    case PROCESS:
      return {
        ...state,
        processing: true,
      };
    case PROCESS_SUCCESS:
      return {
        ...state,
        processing: false,
        data: action.result,
      };
    case PROCESS_FAIL:
      return {
        ...state,
        processing: false,
      };
    default:
      return state;
  }
}

function needLoad(address) {
  return !(address && address.loaded);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/users/me/addresses', {
        auth: 'strict',
      }),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().address)) {
      return dispatch(load());
    }
    return Promise.resolve();
  };
}

export function addAddress(address) {
  return {
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: (client) =>
      client.post('/users/me/addresses', {
        auth: 'strict',
        data: address,
      }),
  };
}

export function updateAddress(payload) {
  return {
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: () => updateUserAddress(payload),
  };
}

export function deleteAddress(id) {
  return {
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: (client) =>
      client.del('/users/me/addresses', {
        auth: 'strict',
        data: {
          address_id: id,
        },
      }),
  };
}

export function getCityByZipCode(zipCode) {
  return () =>
    new Promise((resolve, reject) => {
      getShippingConfigurations(zipCode)
        .then((response) => {
          resolve({ city: response?.city, zipcode: response?.zip, state: response?.state_abbr });
        })
        .catch((error) => {
          reject(error?.errors?.[0]);
        });
    });
}
