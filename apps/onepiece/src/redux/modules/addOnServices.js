import * as Cookie from 'helpers/Cookie';

const LOAD = 'addOnServices/LOAD';
const LOAD_SUCCESS = 'addOnServices/LOAD_SUCCESS';
const LOAD_FAIL = 'addOnServices/LOAD_FAIL';

const initialState = {
  loading: false,
};

export default function addOnServices(state = initialState, action = {}) {
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
        data: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

export function load(number) {
  return (dispatch, getState) => {
    const order = getState().cart.data;
    let orderNumber = number;

    if (!number) {
      if (order && order.create_type === 'schedule_delivery') {
        orderNumber = Cookie.get('service_order_id');
      } else {
        orderNumber = Cookie.get('order_id');
      }
    }

    return dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`/orders/${orderNumber}/shipment_services`, { auth: 'strict' }),
    });
  };
}

export function needLoad(globalState) {
  return !(globalState.addOnServices && globalState.addOnServices.data);
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState())) {
      return dispatch(load());
    }
    return Promise.resolve(getState().addOnServices.data);
  };
}
