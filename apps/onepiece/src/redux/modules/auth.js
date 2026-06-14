import * as Cookie from 'helpers/Cookie';
import { trackCustomer } from 'utils/tracking';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import { EVENT_IDENTIFY } from 'utils/track/constants';
import { getCustomerServiceApi } from 'utils/customer-service/sdk-loader';
import { setFbUserInLocalStorage, getFbUserInSession, clearFbUserInLocalStorage } from 'utils/facebook';
import { LocalStorageNames } from 'config/storage-name';
import { load as loadCart } from './cart';
import { load as loadWishlist } from './wishlist';
import { load as loadTheLookWishlist } from './theLookWishlist';
import { hide as hideFixbar } from './fixBar';
import { hideSubscriptionBar } from './subscriptionBar';

const LOAD = 'auth/LOAD';
const LOAD_SUCCESS = 'auth/LOAD_SUCCESS';
const LOAD_FAIL = 'auth/LOAD_FAIL';
const PROCESS = 'auth/PROCESS';
const PROCESS_SUCCESS = 'auth/PROCESS_SUCCESS';
const PROCESS_FAIL = 'auth/PROCESS_FAIL';
const UNLOAD = 'auth/UNLOAD';
const PROCESS_USER_TERMS_VERSION = 'auth/PROCESS_USER_TERMS_VERSION';
const PROCESS_USER_TERMS_VERSION_SUCCESS = 'auth/PROCESS_USER_TERMS_VERSION_SUCCESS';
const PROCESS_USER_TERMS_VERSION_FAIL = 'auth/PROCESS_USER_TERMS_VERSION_FAIL';

const initialState = {
  loaded: false,
};

export const selectedUser = (state) => state?.auth?.user;

export default function auth(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      if (action.result?.email) {
        action.result.emailHashed = encHex.stringify(sha256(action.result.email.toLowerCase()));
      }

      if (action.result?.phone) {
        action.result.phoneHashed = encHex.stringify(sha256(action.result.phone));
      }

      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };
    case PROCESS:
      return {
        ...state,
        processing: true,
      };
    case PROCESS_SUCCESS:
      if (action.result?.email) {
        action.result.emailHashed = encHex.stringify(sha256(action.result.email.toLowerCase()));
      }

      if (action.result?.phone) {
        action.result.phoneHashed = encHex.stringify(sha256(action.result.phone));
      }

      return {
        ...state,
        processing: false,
        user: action.result,
      };
    case PROCESS_FAIL:
      return {
        ...state,
        processing: false,
        error: action.error,
      };
    case UNLOAD:
      return {
        ...state,
        loaded: false,
        user: null,
      };
    case PROCESS_USER_TERMS_VERSION_SUCCESS:
      return {
        ...state,
        accepted_version: action.result?.accepted_version,
      };
    default:
      return state;
  }
}

export function needLoad(globalState) {
  // need to load even loading because we can't let it pass if the data is not ready
  return !(globalState.auth && globalState.auth.loaded);
}

function setUser(user = {}, dispatch, payload = {}) {
  trackCustomer(user);
  if (window !== undefined && user.email) {
    clearFbUserInLocalStorage();
    window.__user = user; // FIXME: remove __user in the future
    const name = `${user.firstname || ''} ${user.lastname || ''}`;
    const { isLogin } = payload;
    getCustomerServiceApi()
      .then((api) => {
        api.setUser({ name, email: user.email });
      })
      .catch(() => {});
    dispatch({
      type: EVENT_IDENTIFY,
      result: {
        method: isLogin ? 'log in' : 'signed in',
      },
    });
    // update fb user to local storage
    const sessionFbUser = getFbUserInSession();
    if (sessionFbUser && sessionFbUser[LocalStorageNames.fbLoginEmail] === user.email) {
      setFbUserInLocalStorage(
        sessionFbUser[LocalStorageNames.fbLoginEmail],
        sessionFbUser[LocalStorageNames.fbLoginId]
      );
    }
  }
}

function loadUser() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/users/me', {
        auth: 'strict',
      }),
  };
}

/**
 *
 * we need to load or merge cart in ciient side
 * Server side we don't load cart to increase first
 * time loading speed
 *
 */

export function load(param = {}) {
  return (dispatch) => {
    const loadPromise = dispatch(loadUser());
    if (__CLIENT__) {
      // only update chat and load cart on client
      loadPromise
        .then(
          (user) => {
            const { isLogin } = param;
            setUser(user, dispatch, { isLogin });
          },
          () => {}
        )
        .then(() => {
          if (!location.search.includes('serviceOrder')) {
            dispatch(loadCart());
          }
        })
        .catch(() => {});
    }

    return loadPromise;
  };
}

/**
 *
 * Sync load is to load user and cart in sequence and
 * return the last promise. used in checkout and only on client side after login
 * Only here merge error is delayed
 *
 */

export function loadSync(param = {}) {
  return (dispatch) => {
    const loadUserPromise = dispatch(loadUser());
    const loadCartPromise = loadUserPromise
      .then((user) => {
        const { isLogin } = param;
        setUser(user, dispatch, { isLogin });
      })
      .catch(() => {})
      .then(() => dispatch(loadCart(true)));
    return loadCartPromise;
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState())) {
      return dispatch(load());
    }
    const { user } = getState().auth;
    return Promise.resolve(user);
  };
}

export function update(data) {
  return {
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: (client) =>
      client.put('/users/me', {
        auth: 'strict',
        data,
      }),
  };
}

export function importUser(user) {
  return {
    type: LOAD_SUCCESS,
    result: user,
  };
}

// the second param sync is to sync load user and cart
export function login(tokens, user, sync = false) {
  return (dispatch, getState) => {
    Cookie.set('access_token', tokens.access_token);
    Cookie.set('refresh_token', tokens.refresh_token);

    // load wishlist
    dispatch(loadWishlist());
    dispatch(loadTheLookWishlist());
    dispatch(hideFixbar());
    dispatch(
      hideSubscriptionBar({
        showOnProductPage: false,
        showOnHomePage: false,
      })
    );
    // clear cookie
    Cookie.remove('guest_token');
    Cookie.remove('wishlist_token');
    if (user) {
      setUser(user, dispatch, { isLogin: true });
      dispatch(importUser(user));
      if (sync) {
        return dispatch(loadCart(true));
      }
      return Promise.resolve();
    }
    let request;
    if (sync) {
      request = dispatch(loadSync({ isLogin: true }));
    } else {
      request = dispatch(load({ isLogin: true }));
    }
    return request;
  };
}

export function logout({ reload = true } = {}) {
  Cookie.remove('access_token');
  Cookie.remove('refresh_token');
  getCustomerServiceApi()
    .then((api) => {
      api.clearUser();
    })
    .catch(() => {});
  reload && window.location.reload();
}

export function getUserTermsVersion({ accessToken }) {
  const header = accessToken ? { 'X-Access-Token': accessToken } : {};
  return {
    types: [PROCESS_USER_TERMS_VERSION, PROCESS_USER_TERMS_VERSION_SUCCESS, PROCESS_USER_TERMS_VERSION_FAIL],
    promise: (client) =>
      client.get('/users/terms_of_use_log', {
        header,
        auth: 'loose',
      }),
  };
}

export function updateUserTermsVersion({ data, accessToken }) {
  const header = accessToken ? { 'X-Access-Token': accessToken } : {};
  return {
    types: [PROCESS_USER_TERMS_VERSION, PROCESS_USER_TERMS_VERSION_SUCCESS, PROCESS_USER_TERMS_VERSION_FAIL],
    promise: (client) =>
      client.put('/users/terms_of_use_log', {
        auth: 'loose',
        header,
        data,
      }),
  };
}
