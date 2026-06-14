const LOAD = 'subscription/LOAD';
const LOAD_SUCCESS = 'subscription/LOAD_SUCCESS';
const LOAD_FAIL = 'subscription/LOAD_FAIL';
const PROCESS = 'subscription/PROCESS';
const PROCESS_SUCCESS = 'subscription/PROCESS_SUCCESS';
const PROCESS_FAIL = 'subscription/PROCESS_FAIL';

const initialState = {
  loading: true,
  processing: false,
};

export default function subscription(state = initialState, action = {}) {
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

function needLoad(subscriptions) {
  return !(subscriptions && subscriptions.data);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/users/me/subscriptions', {
        auth: 'strict',
      }),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().subscription)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().subscription.data);
  };
}

export function update(isSub) {
  return (dispatch, getState) => {
    const sub = getState().subscription.data;
    if (sub) {
      const targetGroupIndex = sub.message_groups.findIndex((g) => g.name === 'promotions');

      if (targetGroupIndex === -1) {
        return Promise.reject();
      }

      const targetGroup = sub.message_groups[targetGroupIndex];

      if (targetGroup.deliver_types.email === isSub) {
        return Promise.resolve(getState().subscription.data);
      }

      const newMessageGroups = sub.message_groups.slice();
      newMessageGroups.splice(targetGroupIndex, 1, {
        ...targetGroup,
        deliver_types: {
          ...targetGroup.deliver_types,
          email: isSub,
        },
      });

      return dispatch({
        types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
        promise: (client) =>
          client.put('/users/me/subscriptions', {
            auth: 'strict',
            data: {
              unsubscribe_reason: '',
              message_groups: newMessageGroups,
            },
          }),
      });
    }
    return dispatch({
      types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
      promise: (client) =>
        client.post('/subscriptions', {
          auth: 'strict',
          data: {
            email: getState().auth.user.email,
          },
        }),
    }).then(() => dispatch(update(isSub)));
  };
}

export function updateMsgGroupsSubscription(data, reason) {
  return (dispatch, getState) => {
    const sub = getState().subscription.data;

    if (sub) {
      const targetGroupIndex = sub.message_groups.findIndex((g) => g.name === 'promotions');

      if (targetGroupIndex === -1) {
        return Promise.reject();
      }

      const targetGroup = sub.message_groups[targetGroupIndex];
      const noChange = Object.keys(data).every((key) => data[key] === targetGroup.deliver_types[key]);
      if (noChange && Object.keys(data) === Object.keys(targetGroup.deliver_types)) {
        return Promise.resolve(getState().subscription.data);
      }

      const newMessageGroups = sub.message_groups.slice();
      newMessageGroups.splice(targetGroupIndex, 1, {
        ...targetGroup,
        deliver_types: {
          ...targetGroup.deliver_types,
          ...data,
        },
      });
      return dispatch({
        types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
        promise: (client) =>
          client.put('/users/me/subscriptions', {
            auth: 'strict',
            data: {
              unsubscribe_reason: '',
              message_groups: newMessageGroups,
            },
          }),
      });
    }

    return dispatch({
      types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
      promise: (client) =>
        client.post('/subscriptions', {
          auth: 'strict',
          data: {
            email: getState().auth.user.email,
          },
        }),
    }).then(() => dispatch(update(data, reason)));
  };
}

export function importSubscription(subscriptions) {
  return {
    type: LOAD_SUCCESS,
    result: subscriptions,
  };
}
