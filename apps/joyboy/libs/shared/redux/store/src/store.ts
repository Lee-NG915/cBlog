/* Core */
import {
  configureStore,
  ListenerEffectAPI,
  TypedStartListening,
  TypedAddListener,
  createListenerMiddleware,
  addListener,
  ThunkAction,
  Action,
} from '@reduxjs/toolkit';
import {
  useSelector as useReduxSelector,
  useDispatch as useReduxDispatch,
  useStore,
  type TypedUseSelectorHook,
} from 'react-redux';
/* Instruments */
import { reducer } from './rootReducer';
import { middleware } from './middleware';
import { Context, createWrapper } from 'next-redux-wrapper';
import { EcEnv } from '@castlery/config';
import { makeExtraArgument } from '@castlery/shared-redux-extra';
import { logger } from '@castlery/observability';

// Create the middleware instance and methods
const listenerMiddlewareInstance = createListenerMiddleware({
  onError: (error) => logger.error('Redux listener middleware error', { error }),
  extra: makeExtraArgument(),
});

export const makeStore = (context?: Context) => {
  return configureStore({
    reducer,
    // eslint-disable-next-line
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: makeExtraArgument(context),
        },
      })
        .prepend(listenerMiddlewareInstance.middleware)
        .concat(middleware),
    // preloadedState,
    devTools: EcEnv.NODE_ENV === 'development',
    preloadedState: {},
  });
};

export const useDispatch = () => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export const startAppListening = listenerMiddlewareInstance.startListening as AppStartListening;
export const addAppListener = addListener as AppAddListener;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useReduxDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// export const useAppStore = useStore.withTypes<AppStore>();
export const useAppStore = useStore as () => AppStore;

export const wrapper = createWrapper<AppStore>(makeStore, {
  debug: EcEnv.NODE_ENV === 'development',
});

/* Types */
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
// TODO 添加了Required，因为在listener.effect.ts中使用了getState()，如果不添加Required，会报错
export type RootState = Required<ReturnType<AppStore['getState']>>;

// @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;

export type AppListenerEffectAPI = ListenerEffectAPI<RootState, AppDispatch>;

// @see https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export type AppAddListener = TypedAddListener<RootState, AppDispatch>;
