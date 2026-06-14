import React from 'react';
import PropTypes from 'prop-types';
import HtmlEngine from 'server/utils/HtmlEngine';
import Bowser from 'bowser';
import serialize from 'serialize-javascript';
import { match } from 'react-router';
import { Provider } from 'react-redux';
import createStore from 'redux/create';
import AsyncLoad from 'components/AsyncLoad';
import { loadOnServer } from 'components/AsyncLoad/utils';
import { StackManager } from 'components/Stack';
import Maintenance from 'components/Maintenance';
import { ThemeCompositionProvider } from 'theme/themeProvider';
import { setUpMemoryHistory } from 'helpers/History';
import ApiClient from 'helpers/ApiClient';
import { getLegacyPageByUrl, getPageByUrl, getReducedDataForClient, getUrl } from 'pages';
import Script from 'components/Script';
import getRoutes from '../../routes';
import logger from '../utils/logger';

const CriticalScript = ({
  store,
  taxonomy = {
    collections: [],
    categories: [],
  },
  salePages = [],
  storyblokPages = [],
  globalNav = [],
  storyblokSalePages = [],
  storyblokBlogPages = [],
  menuData = {},
  termsHistory = [],
}) => (
  <Script
    strategy="beforeInteractive"
    text={
      `window.__data=${serialize(store && store.getState())};window.__taxonomy=${serialize(
        taxonomy
      )};window.__salePages=${serialize(salePages)};window.__globalNav=${serialize(
        globalNav
      )};window.__menuData=${serialize(menuData)};window.__termsHistory=${serialize(
        termsHistory
      )};window.__storyblokPages=${serialize(storyblokPages)};window.__storyblokBlogPages=${serialize(
        storyblokBlogPages
      )};window.__storyblokSalePages=${serialize(storyblokSalePages)};window.__user=${serialize(
        store && store.getState()?.auth?.user
      )};` +
      // https://github.com/aFarkas/lazysizes#js-api---options
      `window.__DISABLE_SSR__ = ${__DISABLE_SSR__ || global.ENABLE_CSR};`
    }
    position="body"
  />
);

CriticalScript.propTypes = {
  store: PropTypes.object,
  taxonomy: PropTypes.object,
  salePages: PropTypes.array,
  storyblokPages: PropTypes.array,
  storyblokSalePages: PropTypes.array,
  globalNav: PropTypes.array,
  storyblokBlogPages: PropTypes.array,
  menuData: PropTypes.object,
  termsHistory: PropTypes.array,
};

export const renderMain =
  ({ namespace, pretty }) =>
  (req, res) => {
    // for sensitive pages, we don't want to cache
    // because CriticalScript => window.__data => user info
    res.setHeader('Cache-Control', 'no-cache, no-store');

    const engine = new HtmlEngine({ entry: 'main', namespace });
    // detect legacy link and redirect
    const legacyPage = getLegacyPageByUrl(req.path.replace(__BASE_ROUTE__, ''));

    if (legacyPage) {
      res.redirect(
        301,
        `${__BASE_ROUTE__}${legacyPage.redirectUrl || getUrl('sale') || ''}${
          legacyPage.from ? `?from=${legacyPage.from}` : ''
        }`
      );
      return;
    }

    // detect legacy browsers
    const userAgent = req.headers['user-agent'];
    const browser = Bowser.getParser(userAgent);
    const isUnsupportedBrowser = browser.satisfies({
      ie: '<=11',
      safari: '<=12',
      android: '<=4',
      chrome: '<33',
      firefox: '<29',
    });

    // detect web view
    const isCastleryApp = /Castlery APP/.test(userAgent);

    const client = new ApiClient();
    const location = req.originalUrl.replace(__BASE_ROUTE__, '');

    const history = setUpMemoryHistory(location);
    const store = createStore(client, {
      browser: { supported: !isUnsupportedBrowser, isCastleryApp },
    });

    function hydrateOnClient() {
      // const { categories, collections } = global.__taxonomy;
      // const taxonomy = {
      //   categories,
      //   collections,
      // };
      const { key } = getPageByUrl(location) || {};
      const { taxonomy, salePages, storyblokPages, globalNav, storyblokBlogPages, menuData, termsHistory } =
        getReducedDataForClient(key);

      res.send(
        engine.render(
          <CriticalScript
            store={store}
            taxonomy={taxonomy}
            salePages={salePages}
            storyblokPages={storyblokPages}
            storyblokBlogPages={storyblokBlogPages}
            globalNav={globalNav}
            menuData={menuData}
            termsHistory={termsHistory}
          />
        )
      );
    }

    // client_side_render
    if (__DISABLE_SSR__ || global.ENABLE_CSR) {
      hydrateOnClient();
      return;
    }
    // modify history to make it create path with prefix __BASE_ROUTE__
    match(
      {
        history,
        routes: getRoutes(store),
        location: location || '/',
      },
      (error, redirectLocation, renderProps) => {
        if (global.__maintenance__ === true) {
          const maintenanceComponent = (
            <ThemeCompositionProvider
              appContext={{
                device: req.device,
              }}
            >
              <Maintenance />
            </ThemeCompositionProvider>
          );
          res.status(503).send(engine.render(maintenanceComponent));
          return;
        }
        if (redirectLocation) {
          const { basename, pathname, state, search } = redirectLocation;
          const redirectPath = `${basename}${pathname}${search}`;
          if (state && state.status === 301) {
            res.redirect(301, redirectPath);
          } else {
            res.redirect(redirectPath);
          }
        } else if (error) {
          logger.log('error', 'ROUTER ERROR:', error);
          res.status(500);
          hydrateOnClient();
        } else if (renderProps) {
          const { pathname, basename } = renderProps.location;
          const { key } = getPageByUrl(pathname) || {};
          const {
            taxonomy,
            salePages,
            storyblokPages,
            globalNav,
            storyblokSalePages,
            storyblokBlogPages,
            menuData,
            termsHistory,
          } = getReducedDataForClient(key);
          const pageType = renderProps.routes[renderProps.routes.length - 1].name;
          loadOnServer({ ...renderProps, store, pageType }).then(() => {
            const lastRoute = renderProps.routes[renderProps.routes.length - 1];
            // 'product' is related to route.js page.name
            const isProductPage = lastRoute?.name === 'product';
            if (isProductPage) {
              const productParam = renderProps.params?.product.replace(/[\u200B-\u200D\uFEFF]/g, '');
              const { products } = store.getState();
              const product = products[productParam]?.data;
              if (product?.slug) {
                const productSlug = product.slug;
                if (productParam !== productSlug) {
                  // redirect to new product slug when param is not equal to slug
                  const redirectPath = pathname.startsWith('/pla')
                    ? `${basename}/pla/${productSlug}`
                    : `${basename}/products/${productSlug}`;
                  res.redirect(301, redirectPath);
                  return;
                }
                if (product.variants?.length === 0) {
                  // 404 when variants are empty
                  lastRoute.status = 404;
                }
              } else {
                // 404 when product is not found
                lastRoute.status = 404;
              }
            }
            const component = (
              <ThemeCompositionProvider
                appContext={{
                  device: req.device,
                }}
              >
                <Provider store={store} pageType={pageType}>
                  <CriticalScript
                    store={store}
                    taxonomy={taxonomy}
                    salePages={salePages}
                    storyblokPages={storyblokPages}
                    globalNav={globalNav}
                    storyblokSalePages={storyblokSalePages}
                    storyblokBlogPages={storyblokBlogPages}
                    menuData={menuData}
                    termsHistory={termsHistory}
                  />
                  <AsyncLoad {...renderProps} render={(props) => <StackManager {...props} />} />
                </Provider>
              </ThemeCompositionProvider>
            );

            /* specify http status for 404 */
            const isNotFound = renderProps.routes.filter((route) => route?.status === 404).length > 0;

            res.status(isNotFound ? 404 : 200);
            res.send(engine.render(component));
          });
        } else {
          res.status(404).send('Not found');
        }
      }
    );
  };
