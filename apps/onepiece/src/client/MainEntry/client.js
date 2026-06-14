import 'sass/base.scss';
import 'components/Maintenance/style.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadableReady } from '@loadable/component';
import * as Sentry from '@sentry/react';
import { initClientSentry, captureSourceError } from 'utils/sentry.client.config';
import loadingBar from 'components/LoadingBar';
import { trackCustomer } from 'utils/tracking';
import { initDatadogRum } from 'utils/datadog';
import { EVENT_IDENTIFY } from 'utils/track/constants';
import { SessionStorageNames } from 'config/storage-name';
import { AiChatUtils } from 'utils/casa/ai-chat-utils';
import { initPages } from 'pages';
import { getUserDevice } from 'utils/device';
import lazySizes from 'lazysizes';
import ApiClient from '../../helpers/ApiClient';
import { setUpBrowserHistory } from '../../helpers/History';
import createStore from '../../redux/create';
import getRoutes from '../../routes';
import MainEntry from './index';
import 'lazysizes/plugins/attrchange/ls.attrchange';
import 'lazysizes/plugins/rias/ls.rias';

lazySizes.cfg.lazyClass = 'img-lazyload';
lazySizes.cfg.loadingClass = 'img-lazyloading';
lazySizes.cfg.loadedClass = 'img-lazyloaded';

document.addEventListener('lazybeforeunveil', (e) => {
  const src = e.target.getAttribute('data-src');
  if (!src) {
    return;
  }
  if (src.includes('w_{width}')) {
    // crawler robot
    e.target.setAttribute('data-src', src.replace('w_{width}', 'w_auto'));
  }
});
initPages();
const client = new ApiClient();
// https://docs.sentry.io/platforms/javascript/guides/react/features/redux/
const sentryReduxEnhancer = !__DEVELOPMENT__ && Sentry.createReduxEnhancer({});
const store = createStore(client, window.__data, sentryReduxEnhancer);
const routes = getRoutes(store);
const history = setUpBrowserHistory();
const dest = document.getElementById('root');
const user = store.getState().auth.user || {};

if (!__DEVELOPMENT__ || __SENTRY_DEBUG__) {
  // init sentry
  initClientSentry(Sentry, { routes });
}

if (!__DEVELOPMENT__) {
  // initDatadogRum();
  trackCustomer(user);
}

// 注册内部业务函数
if (typeof window !== 'undefined') {
  window.clsr = window.clsr || {};
  window.clsr.aiChatUtils = new AiChatUtils(store);
}

setTimeout(() => {
  if (user) {
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    const isReload = navType === 'reload';
    const alreadyReported = sessionStorage.getItem(SessionStorageNames.identifyReported);

    if (!alreadyReported || isReload) {
      store.dispatch({
        type: EVENT_IDENTIFY,
        result: {
          method: 'signed in',
        },
      });
      sessionStorage.setItem(SessionStorageNames.identifyReported, '1');
    }
  }
}, 0);

// render the loading bar
loadingBar.init(document.getElementById('loadingBar'));

async function hydrateApp() {
  if (typeof window.IntersectionObserver === 'undefined') {
    await import('intersection-observer');
  }
  loadableReady(() => {
    ReactDOM.hydrate(
      <MainEntry
        store={store}
        history={history}
        routes={routes}
        appContext={{
          device: getUserDevice(),
        }}
      />,
      dest
    );
  });
}
// hydrate App
hydrateApp();
