import registerTracking from './registerTracking';

export default function createTrackingMiddleware(eventsMaps, targets, openInDev = true) {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (__DEVELOPMENT__ && !openInDev) {
        return next(action);
      }
      const preState = getState();
      const result = next(action);
      const nextState = getState();
      if (typeof window !== 'undefined' && action instanceof Object && action.type) {
        Object.keys(eventsMaps).forEach((key) => {
          const eventsMap = eventsMaps[key];
          const target = targets[key];
          const event = eventsMap[action.type];
          registerTracking(event, target, action, preState, nextState, dispatch);
        });
      }
      return result;
    };
}
