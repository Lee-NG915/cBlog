/* eslint-disable import/no-import-module-exports */
import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createTrackingMiddleware, eventsMaps, targets } from 'utils/track';
import apiMiddleware from './middleware/apiMiddleware';
import reducer from './modules/reducer';

export default function createStore(client, data = {}, enhancer) {
  const middleware = [apiMiddleware(client), thunkMiddleware, createTrackingMiddleware(eventsMaps, targets)];
  let store;

  if (__CLIENT__) {
    const enhancers = [
      applyMiddleware(...middleware),
      enhancer,
      __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true }),
    ].filter((f) => f);
    store = _createStore(reducer, data, compose(...enhancers));
  } else {
    store = _createStore(reducer, data, applyMiddleware(...middleware));
  }

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      const nextReducer = require('./modules/reducer').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
