const SET_UNREAD_COUNT = 'fixSideBar/SET_UNREAD_COUNT';

const initialState = {
  unreadCount: 0,
};

export default function fixSideBar(state = initialState, action = {}) {
  switch (action.type) {
    case SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.count,
      };
    default:
      return state;
  }
}

export function setUnreadCount(count) {
  return (dispatch) => {
    dispatch({
      type: SET_UNREAD_COUNT,
      count,
    });
  };
}
