import { getShipmentOptions } from 'api/order';

const LOAD = 'order/LOAD';
const LOAD_SUCCESS = 'order/LOAD_SUCCESS';
const LOAD_FAIL = 'order/LOAD_FAIL';
const LOAD_SHIPMENT_OPTIONS = 'order/LOAD_SHIPMENT_OPTIONS';
const LOAD_SHIPMENT_OPTIONS_SUCCESS = 'order/LOAD_SHIPMENT_OPTIONS_SUCCESS';
const LOAD_SHIPMENT_OPTIONS_FAIL = 'order/LOAD_SHIPMENT_OPTIONS_FAIL';

const initialState = {
  loaded: false,
  loading: true,
};

export default function order(state = initialState, action = {}) {
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
        loaded: true,
      };
    case LOAD_SHIPMENT_OPTIONS:
      return {
        ...state,
        loadShipmentOptions: true,
      };

    case LOAD_SHIPMENT_OPTIONS_SUCCESS:
      return {
        ...state,
        shipmentOptions: action.result,
        loadShipmentOptions: false,
      };
    case LOAD_SHIPMENT_OPTIONS_FAIL:
      return {
        ...state,
        loadShipmentOptions: false,
      };
    default:
      return state;
  }
}

function needLoad(order) {
  return !(order && order.loaded);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/users/me/orders', {
        auth: 'strict',
      }),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().order)) {
      return dispatch(load());
    }
    return Promise.resolve();
  };
}

export function loadShipmentOptions({ orderNumber }) {
  return {
    types: [LOAD_SHIPMENT_OPTIONS, LOAD_SHIPMENT_OPTIONS_SUCCESS, LOAD_SHIPMENT_OPTIONS_FAIL],
    promise: () => getShipmentOptions({ orderNumber }),
  };
}
