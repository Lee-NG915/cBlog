export const BEGIN_GLOBAL_LOAD = 'asyncLoad/BEGIN_GLOBAL_LOAD';
export const END_GLOBAL_LOAD = 'asyncLoad/END_GLOBAL_LOAD';

export default function asyncLoad(state = { loaded: false, loading: false }, action = {}) {
  switch (action.type) {
    case BEGIN_GLOBAL_LOAD:
      return {
        loaded: false,
        loading: true,
      };
    case END_GLOBAL_LOAD:
      return {
        loaded: true,
        loading: false,
      };
    default:
      return state;
  }
}

export function beginGlobalLoad() {
  return { type: BEGIN_GLOBAL_LOAD };
}

export function endGlobalLoad() {
  return { type: END_GLOBAL_LOAD };
}
