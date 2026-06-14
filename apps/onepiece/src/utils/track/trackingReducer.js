import { getPageByUrl, removeKnightPrefix } from 'pages';
import { getBreadcrumbNames, findBrand, getLastPageView, getOriginalAmount } from './common';
import { EVENT_ADD_PRODUCT_IMPRESSION, EVENT_PAGE_VIEW, EVENT_PRODUCT_IMPRESSION } from './constants';

const initialState = {
  historyViews: [],
  impressions: [],
};
export default function trackingReducer(state = initialState, action = {}) {
  const { type, result } = action;
  switch (
    type // store pageview info
  ) {
    case EVENT_PAGE_VIEW:
      return {
        ...state,
        historyViews: state.historyViews.concat({
          pathname: result.pathname || '',
          pageName: result.pageName || '',
          search: result.search || '',
        }),
      };
    case EVENT_ADD_PRODUCT_IMPRESSION:
      return {
        ...state,
        impressions: state.impressions.concat(getImpression(state, result)),
      };
    case EVENT_PRODUCT_IMPRESSION:
      return {
        ...state,
        impressions: [],
      };
    default:
      return state;
  }
}

function getImpression(state, result) {
  const { taxons, variant } = result;
  const { pathname } = getLastPageView(state.historyViews) || {};

  const { name, sku, price } = variant;
  const brand = findBrand(taxons);
  const [pageName, subPageName] = getBreadcrumbNames(taxons);
  const page = getPageByUrl(pathname);

  return {
    id: sku,
    name,
    price: getOriginalAmount(price),
    dimension1: pageName,
    category: subPageName,
    brand,
    list: page ? removeKnightPrefix(page.key) : '',
  };
}
