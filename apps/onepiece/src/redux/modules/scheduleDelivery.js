const LOAD = 'scheduleDelivery/LOAD';
const LOAD_SUCCESS = 'scheduleDelivery/LOAD_SUCCESS';
const LOAD_FAIL = 'scheduleDelivery/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function scheduleDelivery(state = initialState, action = {}) {
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

export function getScheduleDeliveryInfo(orderId) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/schedule_delivery_info', {
        auth: 'strict',
        params: {
          fulfillment_order_id: orderId,
        },
      }),
  };
}

export function load(orderId) {
  return (dispatch) => dispatch(getScheduleDeliveryInfo(orderId));
}
