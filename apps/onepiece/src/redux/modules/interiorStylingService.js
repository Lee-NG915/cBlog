import { isOutdated } from 'utils/time';

const LOAD = 'ISS/LOAD';
const LOAD_SUCCESS = 'ISS/LOAD_SUCCESS';
const LOAD_FAIL = 'ISS/LOAD_FAIL';
const initialState = {};

export const selectISSSeo = (state) => {
  const { seo = [] } = state.iss.data || {};
  const res = seo.filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate)).pop();

  return res || {};
};
export const selectISSBanner = (state) => {
  const { banner = [] } = state.iss.data || {};
  const res = banner
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();

  return res;
};
export const selectISSDesigners = (state) => {
  const { designers = [] } = state.iss.data || {};
  const res = designers
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();

  return res;
};
export const selectISSFooter = (state) => {
  const { footer = [] } = state.iss.data || {};
  const res = footer
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();

  return res || {};
};
export const selectISSIcons = (state) => {
  const { icons = [] } = state.iss.data || {};
  const res = icons
    .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
    .pop();
  return res || {};
};
export const selectISSCards = (state) => {
  const { cards = [] } = state.iss.data || {};
  const res = cards.map((item) => ({
    ...item,
    card: item.card
      .filter(({ startTimeAndDate, endTimeAndDate }) => !isOutdated(startTimeAndDate, endTimeAndDate))
      .slice(0, 3),
  }));

  return res || {};
};

export default function ISS(state = initialState, action = {}) {
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

function needLoad(ISS) {
  return !(ISS && ISS.data);
}

export function load() {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`/story_bloks/iss`),
    });
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().ISS)) {
      return dispatch(load());
    }

    return Promise.resolve(getState().ISS.data);
  };
}
