import { isOutdated } from 'utils/time';

const LOAD = 'showroom-exclusives/LOAD';
const LOAD_SUCCESS = 'showroom-exclusives/LOAD_SUCCESS';
const LOAD_FAIL = 'showroom-exclusives/LOAD_FAIL';
const initialState = {};

export const selectO2OSeo = (state) => {
  const { seo = [] } = state.o2o.data || {};

  const res = seo.filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate)).pop();

  return res || {};
};
export const selectO2OBanner = (state) => {
  const { banner = [] } = state.o2o.data || {};
  const res = banner
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();

  return res;
};
export const selectO2OFooter = (state) => {
  const { footer = [] } = state.o2o.data || {};
  const res = footer
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();

  return res || {};
};
export const selectO2OIcons = (state) => {
  const { icons = [] } = state.o2o.data || {};
  const res = icons
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();
  return res || {};
};
export const selectO2OCards = (state) => {
  const { cards = [] } = state.o2o.data || {};
  const res = cards.map((item) => ({
    ...item,
    card: item.card
      .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
      .slice(0, 4),
  }));

  return res || {};
};

export default function o2o(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS: {
      const data = action.result.story.content;
      return {
        ...state,
        loading: false,
        data,
      };
    }
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

function needLoad(o2o) {
  return !(o2o && o2o.data);
}

export function load() {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get(`/story_bloks/${__COUNTRY__.toLocaleLowerCase()}/general-configuration/dedicated-configuration/o2o`),
    });
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().o2o)) {
      return dispatch(load());
    }

    return Promise.resolve(getState().o2o.data);
  };
}
