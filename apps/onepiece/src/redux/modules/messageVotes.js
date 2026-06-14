import { v4 as uuidV4 } from 'uuid';

import * as Cookie from 'helpers/Cookie';

const LOAD = 'messageVotes/LOAD';
const LOAD_SUCCESS = 'messageVotes/LOAD_SUCCESS';
const LOAD_FAIL = 'messageVotes/LOAD_FAIL';
const PROCESS = 'messageVotes/PROCESS';
const PROCESS_SUCCESS = 'messageVotes/PROCESS_SUCCESS';
const PROCESS_FAIL = 'messageVotes/PROCESS_FAIL';

const initialState = {
  loading: true,
  processing: false, // represent adding and removing
};

export default function messageVotes(state = initialState, action = {}) {
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

function needLoad(messageVotes) {
  return !(messageVotes && messageVotes.data);
}

export function load() {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token');

    if (accessToken) {
      let loadPromise;

      // merge order if orderId and orderToken exist in cookie
      if (guestToken) {
        loadPromise = dispatch({
          types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
          promise: (client) =>
            client.put('/review_message_votes/merge', {
              auth: 'strict',
              header: {
                'X-Guest-Token': guestToken,
              },
            }),
        });
      } else {
        loadPromise = dispatch({
          types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
          promise: (client) => client.get('/review_message_votes', { auth: 'strict' }),
        });
      }

      return loadPromise;
    }
    if (guestToken) {
      return dispatch({
        types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
        promise: (client) =>
          client.get(`/review_message_votes`, {
            header: {
              'X-Guest-Token': guestToken,
            },
          }),
      });
    }
    dispatch({
      type: LOAD_SUCCESS,
      result: [],
    });

    return Promise.resolve([]);
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().messageVotes)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().messageVotes.data);
  };
}

export function add(id) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    let guestToken = Cookie.get('guest_token');

    if (accessToken) {
      return dispatch({
        types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
        promise: (client) => client.post(`/review_message_votes/${id}`, { auth: 'strict' }),
      });
    }
    if (!guestToken) {
      guestToken = uuidV4();
      Cookie.set('guest_token', guestToken);
    }

    return dispatch({
      types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
      promise: (client) =>
        client.post(`/review_message_votes/${id}`, {
          header: {
            'X-Guest-Token': guestToken,
          },
        }),
    });
  };
}

export function remove(id) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token');

    if (accessToken) {
      return dispatch({
        types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
        promise: (client) => client.del(`/review_message_votes/${id}`, { auth: 'strict' }),
      });
    }
    if (!guestToken) {
      return Promise.reject();
    }

    return dispatch({
      types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
      promise: (client) =>
        client.del(`/review_message_votes/${id}`, {
          header: {
            'X-Guest-Token': guestToken,
          },
        }),
    });
  };
}
