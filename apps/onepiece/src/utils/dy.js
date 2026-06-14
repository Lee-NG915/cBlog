/* eslint-disable no-param-reassign */
import { getBreadcrumbsByPathname } from 'pages';
import { getHistory } from 'helpers/History';
import { get as getCookie } from 'helpers/Cookie';

import { selectedObjToStr } from 'containers/Product/utils';
import isEmpty from 'lodash/isEmpty';

// let currentContext;
// let lastContext;
/**
 * @description Using the accessor pattern to manage context
 */
export const ContextInstance = {
  _current: '',
  _previous: '',
  set current(context) {
    this._previous = this._current;
    this._current = context;
    setRecommendationContext(context);
  },
  get current() {
    return this._current;
  },
  get previous() {
    return this._previous;
  },
  revert() {
    [this._current, this._previous] = [this._previous, this._current];
  },
};

export function getHomePageContext() {
  const currentContext = { type: 'HOMEPAGE', data: [] };
  return currentContext;
}

export function getCategoryContext(pathname) {
  const breadcrumbs = getBreadcrumbsByPathname(pathname) || [];
  const data = breadcrumbs.map((page) => page.name);
  const currentContext = { type: 'CATEGORY', data };
  return currentContext;
}

export function getProductContext(variant) {
  let currentContext;
  if (variant) {
    currentContext = { type: 'PRODUCT', data: [variant.sku] };
  } else {
    currentContext = { type: 'PRODUCT', data: [] };
  }
  return currentContext;
}

export function getCartContext(cart) {
  let currentContext;
  if (!cart) {
    currentContext = { type: 'CART', data: [] };
  } else {
    currentContext = {
      type: 'CART',
      data: cart.line_items.filter((item) => !item.is_swatch).map((item) => item.variant.sku),
    };
  }
  return currentContext;
}

export function getBlogContext(id) {
  return { type: 'PRODUCT', data: [`${id}`] };
}

export function getOtherContext() {
  const currentContext = { type: 'OTHER', data: [] }; // Note: data should be [] or ['xxxxx','xxxxxx'], can't be null
  return currentContext;
}

/**
 * @description This function is used to get the DY recommendation context based on the pageType
 * @note1 Page context is information you pass to Dynamic Yield about every page of your site.
 * This information is used for targeting (for example, using an overlay on the cart page),
 * segmenting users into audiences (for example, users who viewed a specific category),
 * and most importantly: counting pageviews.
 * @note2 Page context timeout
 * The Dynamic Yield script expects context to be set after every URL change, including hashchange events. Query parameters are ignored.
 * When the URL changes, the script waits 100 ms for the page context. If no context is set,
 * the script sets the page type to OTHER to enable timely page rendering.
 * @important If the context is set later than 100ms, DY will automatically send the backup context (page: OTHER),
 * which will cause pageview exceptions, etc.
 */
export function getRecommendationContext({ pageType, state, variant, cart, countAsPageview = true }) {
  const location = getHistory().getCurrentLocation();
  const { pathname } = location;
  if (pageType === 'homepage') {
    return getHomePageContext();
  }
  if (pageType === 'category') {
    return getCategoryContext(pathname);
  }
  if (pageType === 'product' || pageType === 'pla') {
    // FIXME Maybe here we can all get currentVariant from redux uniformly
    if (variant) {
      return getProductContext(variant);
    }
    const currentVariant = getCurrentVariantFromUrl(location, state);
    return getProductContext(currentVariant);
  }
  if (pageType === 'cart') {
    if (cart) {
      return getCartContext(cart);
    }
    if (state) {
      return getCartContext(state.cart.data);
    }
    return getCartContext();
  }
  if (pageType === 'blog') {
    const subPathname = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    return getBlogContext(state?.storyblokBlogPage?.[subPathname]?.data?.id || 0);
  }
  return getOtherContext();
}

export function getCurrentContext() {
  return ContextInstance.current;
}

export function setRecommendationContext(context) {
  if (__CLIENT__ && typeof DY !== 'undefined') {
    DY.recommendationContext = context;
  }
}

export function setCurrentContext(context) {
  ContextInstance.current = context;
}

export function revertLastContext() {
  ContextInstance.revert();
  return ContextInstance.current;
}

export function getCurrentVariantFromUrl(location, state) {
  const productSlug = location.pathname.split('/')[2];
  const productState = state.products[productSlug];
  const product = productState && productState.data;

  if (isEmpty(product)) {
    // TODO Sometimes it will be empty object, positioning is why
    // console.error('product is empty', product);
    return;
  }

  const selected = {};

  // get inital selected from locaton.query
  Object.keys(location.query).forEach((key) => {
    const selectedOptionType = product?.option_types?.find((optionType) => optionType.name === key);
    if (selectedOptionType && selectedOptionType.values.length > 0) {
      const selectedOption = selectedOptionType.values.find((optionValue) => optionValue.name === location.query[key]);
      if (selectedOption) {
        selected[selectedOptionType.id] = selectedOption;
      }
    }
  });

  const selectedVariants = product.customizations.filter(
    // eslint-disable-next-line camelcase
    ({ option_types }) => option_types === selectedObjToStr(selected)
  );

  let currentVariant;
  if (selectedVariants?.length > 0) {
    // Because variants is not the full amount, may not search out (Hard to happen)
    // as ultimately you just want to get the sku,
    // if you really want to fix it,
    // you can add the sku field to the customizationstm（api product）
    currentVariant = product.variants.find(({ id }) => id === selectedVariants[0]?.variant_id);
  }

  return currentVariant || product.variants[0] || {};
}

/**
 * @description Get the payload for the real-time recommendation request
 * @docs https://support.dynamicyield.com/hc/en-us/articles/4414496292497-Return-Recommendations-Real-time-Filter-Data#use-case-2-build-a-product-finder-0-4
 */
export function getRealTimePayload({
  pageType = 'OTHER',
  selectorNames = [],
  customPageAttribute = {},
  campaignName, // required
  options = {},
  rulesConditions,
  customContext,
}) {
  const { query, pathname } = getHistory().getCurrentLocation();
  const previewToken = [];
  let newUser = 'false';
  let pageData = [];

  if (query.dyApiPreview) {
    previewToken.push(query.dyApiPreview);
  }
  pageType = pageType.toUpperCase();
  let type = 'OTHER';
  if (__SERVER__) {
    if (!getCookie('_dyid')) {
      newUser = 'true';
    }
    if (customContext) {
      type = customContext.type;
      pageData = customContext.data;
    }
  } else {
    if (getCookie('newUser') === 'true') newUser = 'true';
    if (customContext) {
      ({ type } = customContext);
      ({ data: pageData } = customContext);
    } else if (window.DY && window.DY.recommendationContext) {
      ({ type } = window.DY.recommendationContext);
      ({ data: pageData } = window.DY.recommendationContext);
    }
  }
  if (typeof type === 'string') {
    pageType = type;
  }
  if (!Array.isArray(pageData)) pageData = [];

  const ipAddress = getCookie('ip_address');

  const payload = {
    header: {
      'Content-Type': 'application/json',
      'dy-api-key': __SERVER__ ? __SERVER_DY_API_KEY__ : __CLIENT_DY_API_KEY__,
    },
    data: {
      user: {
        dyid: getCookie('_dyid'),
        dyid_server: getCookie('_dyid_server'),
      },
      session: {
        dy: getCookie('_dyjsession'),
      },
      context: {
        page: {
          type: pageType,
          location: `${__ONE_PIECE_WEB_SERVER_NAME__}${__BASE_ROUTE__}${pathname}`,
          data: pageData,
        },
        device: {
          ip: ipAddress,
        },
        pageAttributes: { newUser, ...customPageAttribute },
      },
      options,
      selector: {
        names: selectorNames,
        preview: {
          ids: previewToken,
        },
        args: campaignName
          ? {
              [campaignName]: {
                realtimeRules: [
                  {
                    type: 'include', // Include or exclude
                    slots: [],
                    query: {
                      conditions: rulesConditions?.includeConditions || [],
                    },
                  },
                  {
                    type: 'exclude',
                    slots: [],
                    query: {
                      conditions: rulesConditions?.excludeConditions || [],
                    },
                  },
                ],
              },
            }
          : {},
      },
    },
  };
  return payload;
}
