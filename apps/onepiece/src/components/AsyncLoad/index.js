import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useStore, useDispatch } from 'react-redux';
import { StackManager } from 'components/Stack';
import { EVENT_PAGE_VIEW } from 'utils/track/constants';
import { beginGlobalLoad, endGlobalLoad } from 'redux/modules/asyncLoad';
import loadingBar from 'components/LoadingBar';
import { phPageView } from 'utils/posthog';
import { getFbcFromUrlParamAndSetToPersistence } from 'utils/facebook';
import { loadAsyncConnect } from './utils';

const AsyncLoadManager = React.memo((props) => {
  const lastPathname = useRef(null);
  const isFirstRun = useRef(true);
  const dispatch = useDispatch();
  const store = useStore();
  const [routerProps, setRouterProps] = useState(props);

  const asyncLoaded = useMemo(() => store.getState().asyncLoad.loaded, [store]);

  const child = useMemo(() => <StackManager {...routerProps} store={store} />, [routerProps, store]);

  const trackPageView = useCallback(
    ({ location, routes }) => {
      const { pathname, search } = location;
      if (lastPathname.current !== pathname) {
        const route = routes[routes.length - 1];
        if (route) {
          const { pageName } = route;
          dispatch({
            type: EVENT_PAGE_VIEW,
            result: {
              pageName,
              pathname,
              search,
            },
          });
          if (typeof window !== 'undefined') {
            const region = __COUNTRY__.toLowerCase();
            const realPathStr = `/${region}${pathname}`;
            const realPathname = realPathStr.endsWith('/')
              ? realPathStr.substring(0, realPathStr.length - 1)
              : realPathStr;
            phPageView(`${__ONE_PIECE_WEB_SERVER_NAME__}${realPathname}${search}`);
          }
        }
        lastPathname.current = pathname;
      }
    },
    [lastPathname, dispatch]
  );

  useEffect(() => {
    if (isFirstRun.current && asyncLoaded) {
      setRouterProps(props);
      loadingBar.end();
    } else {
      dispatch(beginGlobalLoad());
      loadAsyncConnect({ ...props, store }).then(() => {
        setRouterProps(asyncLoaded ? props : { ...props });
        dispatch(endGlobalLoad());
        loadingBar.end();
      });
    }
    if (isFirstRun.current) {
      isFirstRun.current = false;
    }
  }, [props, store, asyncLoaded, dispatch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getFbcFromUrlParamAndSetToPersistence();
    }
  }, []);

  // support client-side rendering
  if (isFirstRun.current && !store.getState().asyncLoad.loaded) {
    return null;
  }
  if (typeof window !== 'undefined') {
    trackPageView(props);
  }
  return child;
});

export default AsyncLoadManager;
