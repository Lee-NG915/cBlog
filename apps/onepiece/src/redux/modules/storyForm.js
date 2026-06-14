const initialState = {
  loaded: false,
  res: null,
};

export default function storyForm(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case 'SUBMIT_FORM':
      return {
        ...state,
        res: action.promise,
      };
    default:
      return state;
  }
}

export function submitForm() {
  return function (dispatch) {
    dispatch({ type: 'SUBMIT_FORM', promise: (client) => {} });
  };
}
