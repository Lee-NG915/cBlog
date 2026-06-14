/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import { asyncLoad } from 'components/AsyncLoad/utils';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import {
  validateUrl,
  getPageByUrl,
  reqeustAndFillPageDetailIfNeeded,
  getBreadcrumbsByPathname,
  getTopCategoriesConfig,
} from 'pages';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { set as setSearchkitState } from 'redux/modules/searchkitState';
import { getTypeAccessor } from 'utils/searchkit';
import { set as setShippingLocation, get as getShippingLocation } from 'utils/shippingLocation';
import ApiClient from 'helpers/ApiClient';
import { defaultCity, globalFeatureInUS } from 'config';
import Breadcrumbs from 'components/Breadcrumbs';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ThemeCompositionProvider } from 'theme/themeProvider';
import { getUserDevice } from 'utils/device';
import { load as dyApiData , load as loadDYData } from 'redux/modules/dyApiData';
import { load as loadFilterOrder } from 'redux/modules/filterOrder';
import { loadIfNeeded as loadStoryblokPage } from 'redux/modules/storyblokPage';
import Category from './RealCategory';
import NotFound from '../NotFound';
import { getHost, needSubFilter } from './config';
import DummyCategory from './DummyCategory';
import EnhancedSearchkitManager from './EnhancedSearchkitManager';
import { pickupSearchFromSalePage } from './EnhancedSearchkitManager/utils';
import { SeoContent } from './components';

import(/* webpackPrefetch: true, webpackChunkName: "product" */ `../Product/Product`);

function requestDefaultShipping(client) {
  const { zipcode } = defaultCity;
  return client
    .get(`/shipping_configurations/${zipcode}`)
    .then((data) => {
      const { inventory_region_code: inventoryRegionCode, zip, city, state_abbr: stateAbbr } = data;
      if (!inventoryRegionCode) {
        // fallback failed
        throw new Error('Default city does not support delivery!');
      }
      setShippingLocation({
        inventoryRegionCode,
        zipcode: zip,
        city,
        state: stateAbbr,
      });
      return data;
    })
    .catch((err) => {
      console.error(JSON.stringify({ 
        message: 'Default shipping request error', 
        error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err) 
      }, null, 2));
    });
}

function requestShipping() {
  const client = new ApiClient();
  const { zipcode } = getShippingLocation();
  return client
    .get(`/shipping_configurations/${zipcode}`)
    .then((data) => {
      const { inventory_region_code: inventoryRegionCode, zip, city, state_abbr: stateAbbr } = data;
      if (!inventoryRegionCode) {
        // fallback
        return requestDefaultShipping(client);
      }
      setShippingLocation({
        inventoryRegionCode,
        zipcode: zip,
        city,
        state: stateAbbr,
      });
      return data;
    })
    .catch(() =>
      // fallback
      requestDefaultShipping(client)
    );
}

const mainLink = `https://www.castlery.com${__BASE_ROUTE__}`;

const Index = ({ location }) => {
  const { desktop } = useBreakpoints();
  if (validateUrl(location.pathname)) {
    const page = getPageByUrl(location.pathname);
    const faqData = page?.faqs;
    const jsonLd =
      faqData?.length > 0 && Array.isArray(faqData)
        ? [
            `{"@context": "http://schema.org",` +
              `"@type": "FAQPage",` +
              `"mainEntity": [${faqData.map(
                (content) =>
                  `{"@type": "Question",` +
                  `"name": ${JSON.stringify(content.question)},` +
                  `"acceptedAnswer": {` +
                  `"@type": "Answer",` +
                  `"text": ${JSON.stringify(content.answer)}}}`
              )}]}`,
          ]
        : [];

    const breadcrumbs = location.state?.breadcrumbs || getBreadcrumbsByPathname(location.pathname) || [];

    if (breadcrumbs?.length !== 0) {
      const structuredDataBaseBreadcrumbs = {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${mainLink}/`,
          },
          ...breadcrumbs.map((breadcrumb, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            name: breadcrumb.name || breadcrumb.metaTitle,
            item: `${mainLink}${breadcrumb.customUrl || getTopCategoriesConfig()?.[breadcrumb?.permalink] || ''}`,
          })),
        ],
      };

      const { itemListElement } = structuredDataBaseBreadcrumbs;
      if (itemListElement.length > 1 && itemListElement[itemListElement.length - 1].item === mainLink) {
        delete itemListElement[itemListElement.length - 1].item;
      }
      jsonLd.push(JSON.stringify(structuredDataBaseBreadcrumbs));
    }

    return (
      <>
        <Helmet
          path={location.pathname}
          largeImagePreview
          jsonLd={jsonLd}
          preloadImgs={[desktop ? (page?.image || '') : (page?.imageResponsive || '')]}
        />
        <Header />
        <Breadcrumbs location={location} showHome={desktop} />
        <Category
          location={location}
          key={location.pathname}
          isMobile={!desktop}
        />
        <SeoContent location={location} />
        <Footer />
      </>
    );
  }
  return <NotFound location={location} />;
};

Index.propTypes = {
  location: PropTypes.object,
};

export default asyncLoad([
  ({ store: { dispatch } }) => dispatch(dyApiData()),
  ({ store: { dispatch } }) => dispatch(loadFilterOrder('rug_size')),
  ({ store: { dispatch } }) => dispatch(loadFilterOrder('fabric_type')),
  ({ store: { dispatch } }) => dispatch(loadFilterOrder('fabric_feature')),
  ({ location }) => {
    if (__CLIENT__) {
      return reqeustAndFillPageDetailIfNeeded(location.pathname);
    }
    return Promise.resolve();
  },
  ({ location, store: { dispatch } }) => {
    const page = getPageByUrl(location.pathname);
    if (!page) {
      return Promise.resolve();
    }
    if (globalFeatureInUS && page?.url === '/sale') {
      return dispatch(loadStoryblokPage('visual-sale-pages-folder/sales-logged-in'));
    }
    return Promise.resolve();
  },
  ({ location, store: { dispatch } }) => {
    const page = getPageByUrl(location.pathname);
      if (!page) {
        return Promise.resolve();
      }
    if (globalFeatureInUS && page?.url === '/sale') {
      return dispatch(loadStoryblokPage('visual-sale-pages-folder/sales-logged-out'));
    }
    return Promise.resolve();
  },
  ({ location, store }) => {
    const { dispatch } = store;
    const search = pickupSearchFromSalePage(location);

    if (__SERVER__ && validateUrl(location.pathname)) {
      // use react server side render to construct the real searchkit accessor.
      const page = getPageByUrl(location.pathname);
      if (!page) {
        return Promise.resolve();
      }
      const { permalink } = page;
      const isAllCategory = needSubFilter?.includes(permalink);
      const hasCategoryFilter = !permalink || isAllCategory;

      const searchkit = new EnhancedSearchkitManager(getHost(), {
        useHistory: false,
        searchOnLoad: false,
      });
      // add custom type accessor
      const typeAccessor = getTypeAccessor(permalink);
      if (typeAccessor) {
        searchkit.addAccessor(typeAccessor);
      }
      searchkit.emitter.clear();
      // check here https://github.com/searchkit/searchkit-examples/tree/master/searchkit-ssr-express-example
      // make the Filters render in server
      ReactDOMServer.renderToString(
        <ThemeCompositionProvider
          appContext={{
            device: getUserDevice(),
          }}
        >
          <Provider store={store}>
            <DummyCategory
              searchkit={searchkit}
              hasCategoryFilter={hasCategoryFilter}
              isAllCategory={isAllCategory}
              taxonomyPermalink={permalink}
              device={getUserDevice()}
            />
          </Provider>
        </ThemeCompositionProvider>
      );

      if (search && search.includes('quickship=true')) {
        return requestShipping().then(() =>
          searchkit.searchFromUrlQuery(search).then((searchkitState) => {
            const locationKey = `${location.pathname}${location.search}`;
            dispatch(setSearchkitState({ [locationKey]: searchkitState }));
          })
        );
      }
      return searchkit
        .searchFromUrlQuery(search)
        .then((searchkitState) => searchkit.rankingByDy(searchkitState)) // it will effect the first paint
        .then((data) => {
          const { hits: newHits, searchkitState = {} } = data || {};
          if (searchkitState?.results?.hits) {
            searchkitState.results.hits.hits = newHits;
          }
          const locationKey = `${location.pathname}${location.search}`;
          dispatch(setSearchkitState({ [locationKey]: searchkitState }));
        });
    }

    if (search && search.includes('quickship=true')) {
      const { inventoryRegionCode } = getShippingLocation();
      if (!inventoryRegionCode) {
        return requestShipping();
      }
    }

    return Promise.resolve();
  },
])(Index);
