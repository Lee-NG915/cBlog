import { defaultCity } from 'config';
import { get as getCookie, set as setCookie } from 'helpers/Cookie';
import { handleChangeShippingLocation, selectedPrevCorrectShippingLocation } from './geolocation';

const LOAD = 'notice/LOAD';
const DISABLE = 'notice/DISABLE_NOTICE';
const UPDATE_ERROR_CODE = 'notice/UPDATE_ERROR_CODE';

const initialState = {
  loaded: false,
  errorInfo: {},
};
export const selectedErrorInfo = (state) => state.notice.errorInfo;
export default function notice(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loaded: true,
        disabled: action.disabled,
      };
    case DISABLE:
      return {
        ...state,
        disabled: true,
      };
    case UPDATE_ERROR_CODE: {
      const { errorCode, errorZipcode } = action.payload;
      return {
        ...state,
        errorInfo: {
          errorCode,
          errorZipcode,
        },
      };
    }
    default:
      return state;
  }
}

function load() {
  // disabled notice if found in cookie
  const isNoticeDisabled = getCookie('is_notice_disabled');
  return {
    type: LOAD,
    disabled: isNoticeDisabled === '1',
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (!(getState().notice && getState().notice.loaded)) {
      dispatch(load());
    }
    return Promise.resolve();
  };
}

export const updateErrorCore = ({ error, errorZipcode }) => {
  const code = error?.errors?.[0]?.code || '';
  return {
    type: UPDATE_ERROR_CODE,
    payload: {
      errorCode: code,
      errorZipcode,
    },
  };
};

/**
 * when errorCode equal 400111 will show ZIPCODE_FAILURE_POPUP
 * and Rollback to the last legal city information
 * @param {*} err
 * @returns
 */
export const handleErrorZipcode =
  ({ error, errorZipcode }, useDefaultShippingLocation = false) =>
  (dispatch, getState) => {
    dispatch(updateErrorCore({ error, errorZipcode }));
    const prevCorrectCity = useDefaultShippingLocation ? defaultCity : selectedPrevCorrectShippingLocation(getState());
    dispatch(handleChangeShippingLocation(prevCorrectCity));
  };

function _disableNotice() {
  return {
    type: DISABLE,
  };
}

export function disableNotice() {
  // set cookie
  setCookie('is_notice_disabled', '1', 7);
  // set state
  return _disableNotice();
}
