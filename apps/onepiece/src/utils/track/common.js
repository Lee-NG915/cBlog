import { getBreadcrumbsByPathname, getPageByUrl, getUrl, removeKnightPrefix } from 'pages';
import { getBreadcrumbsByPathname as getFooterBreadcrumbsByPathname } from 'components/Footer/config';
import { getVariantLink } from 'utils/link';
import { STOCK_STATE } from 'redux/modules/productOptions';
import ModalState from 'containers/Frame/modalState.ts';
import { get as getCookie } from 'helpers/Cookie';
import { gtmPageBasicParams, gtmPageNames } from './config';

/* For GTM */
export function getOriginalAmount(amount) {
  if (!amount && amount !== 0) {
    return '';
  }
  const unitPriceTaxRate = {
    AU: 1.1,
    SG: 1.09,
    US: 1,
    CA: 1,
    UK: 1.2,
  };
  return (amount / unitPriceTaxRate[__COUNTRY__]).toFixed(2);
}

export function getApproximateTax(amount) {
  if (!amount && amount !== 0) {
    return '';
  }
  const taxRate = {
    AU: 0.1,
    SG: 0.07,
    US: 0,
    CA: 0,
    UK: 0.2,
  };
  return (amount * taxRate[__COUNTRY__]).toFixed(2);
}

// get backend categories from taxons
export function getBreadcrumbNames(taxons) {
  if (!Array.isArray(taxons)) {
    return ['', ''];
  }
  const { name } = taxons.find((item) => item.level === 1) || {};
  const { name: subName } = taxons.find((item) => item.level === 2) || {};
  return [name || '', subName || ''];
}

export function getBreadcrumbKeysByPathname(pathname) {
  const pages = getBreadcrumbsByPathname(pathname) || getFooterBreadcrumbsByPathname(pathname);
  if (pages) {
    return pages.map((page) => removeKnightPrefix(page.key));
  }
  return ['', ''];
}

export function findBrand(taxons) {
  const taxon = taxons?.find((t) => t.level === 1 && t.ancestors?.[0] === 'Collections');
  return taxon ? taxon.name : 'No Brand';
}

export function calcWeeks(leadTime) {
  const result = leadTime / 7;
  const start = Math.floor(result);
  const end = Math.floor(result + 1);
  return `${start}-${end} weeks`;
}

export function getLastPageView(historyViews) {
  if (historyViews instanceof Array && historyViews.length) {
    return historyViews[historyViews.length - 1];
  }
  return null;
}

export function getNumOfPageViews(historyViews) {
  if (historyViews instanceof Array && historyViews.length) {
    return historyViews.length;
  }
  return 0;
}

export function getCartValuesByOrder(order) {
  let { total, included_tax_total: includedTaxTotal } = order || {};
  if (total === undefined) {
    total = 0;
  }
  if (includedTaxTotal === undefined) {
    includedTaxTotal = 0;
  }
  const totalValue = (+total).toFixed(2);
  return {
    cartValue: __COUNTRY__ === 'US' ? null : totalValue, // total rev value of cart inc vat
    cartValueNet: __COUNTRY__ === 'US' ? totalValue : (total - includedTaxTotal).toFixed(2), // total rev value of cart excl VAT/taxes
  };
}

export function getPageViewParams(action, preState, nextState) {
  const { pathname, pageName } = action.result;
  const isPLAPage = pathname.startsWith('/pla/');
  const { user } = nextState.auth;
  let isNewCustomer = '';
  if (user && nextState.cart.data) {
    isNewCustomer = Boolean(nextState.cart.data.first_purchase);
  }
  let { pageCat = '', pageType = '', pageContent = '', pageProduct = '' } = gtmPageBasicParams[pageName];
  let page;
  let otherParams = {
    pageCountry: __COUNTRY__,
    currencyCode: __CURRENCY__,
  };
  let routeSegment = '';
  switch (pageName) {
    case gtmPageNames.categoryPage:
      [pageContent, pageProduct] = getBreadcrumbKeysByPathname(pathname);
      break;
    case gtmPageNames.salePage:
      page = getPageByUrl(pathname);
      pageProduct = page ? removeKnightPrefix(page.key) : '';
      break;
    case gtmPageNames.seoPage:
      page = getPageByUrl(pathname);
      pageProduct = page ? removeKnightPrefix(page.key) : '';
      break;
    case gtmPageNames.collectionPage:
      page = getPageByUrl(pathname);
      pageProduct = page ? removeKnightPrefix(page.key) : '';
      break;
    case gtmPageNames.productDetailPage:
      if (nextState) {
        const { productOptions, products } = nextState;
        const { productSlug } = productOptions;
        const { data } = products[productSlug] || {};
        const { taxons, variants } = data || {};
        [pageContent, pageProduct] = getBreadcrumbNames(taxons);
        const { sku, name, price, list_price: listPrice } = variants ? variants[0] || {} : {};
        const isSale = listPrice - price > 0;
        otherParams = {
          ...otherParams,
          productCode: sku,
          productName: name,
          productPrice: getOriginalAmount(price), // product unit price, no commas, excl tax
          productSale: isSale ? 'sale' : 'full', // 'sale' if reduced price; 'full' if standard price
        };
      }
      break;

    case gtmPageNames.cartPage:
      if (nextState) {
        const { data } = nextState.cart;
        const cartValues = getCartValuesByOrder(data);
        otherParams = {
          ...otherParams,
          ...cartValues,
        };
      }
      break;
    case gtmPageNames.checkoutPage:
      if (pathname.endsWith('success')) {
        pageCat = 'checkout';
        pageType = 'checkout';
        pageContent = 'checkout-confirm';
      } else {
        pageCat = 'checkout';
        pageType = 'checkout';
        pageContent = 'checkout';
      }
      if (nextState) {
        const { data } = nextState.cart;
        const cartValues = getCartValuesByOrder(data);
        otherParams = {
          ...otherParams,
          ...cartValues,
        };
      }
      break;
    case gtmPageNames.shopTheLookPage:
      routeSegment = pathname.split('/').pop();
      if (routeSegment === 'by-collection') {
        pageCat = 'collection';
        pageContent = 'collection';
        pageProduct = 'collection';
      } else if (['living-room', 'dining-room', 'bedroom', 'outdoor'].includes(routeSegment)) {
        pageCat = 'room';
        pageContent = routeSegment;
        pageProduct = routeSegment;
      }
      break;
    default:
  }
  let pageVariant = '';
  if (isPLAPage) {
    const variant = getCookie('X-Exp-PlaLayout');
    pageVariant = variant ? `pla-layout-${variant}` : '';
  }
  return {
    pageCat,
    pageType,
    pageContent,
    pageProduct,
    pageCountry: __COUNTRY__,
    userID: user ? user.id : '',
    userType: user ? 'member' : 'guest',
    userStatus: user ? 'logged-in' : 'logged-out',
    userEmail: user?.emailHashed || '',
    userPhone: user?.phoneHashed || '',
    isNewCustomer,
    ...otherParams,
    pageVariant, // 页面变体，在新web中页面可能存在变体
  };
}

export function getProductNeedTracking(lineItem, quantityDifference = 0) {
  if (!lineItem) return null;
  const { variant, quantity, stock_state: stockState, delivery_lead_time: deliveryLeadTime } = lineItem;
  const { sku, name, price, list_price: listPrice, product_taxons: productTaxons } = variant;
  const originalPrice = getOriginalAmount(price);
  const [pageName, subPageName] = getBreadcrumbNames(productTaxons);
  const brand = findBrand(productTaxons);
  const originalDiscountAmount = getOriginalAmount(listPrice - price);
  const isSale = +originalDiscountAmount > 0;
  let qty;
  if (quantityDifference) {
    qty = +quantityDifference;
  } else {
    qty = quantity;
  }
  return {
    id: sku,
    name,
    price: originalPrice,
    category: subPageName, // second category
    brand, // collection name
    dimension1: pageName, // first category
    dimension2: stockState, // stock state, values: IN_STOCK, OUT_OF_STOCK, IN_STOCK_SOON
    dimension3: isSale ? 'sale' : 'full', // is product in sale, values: sale, full
    dimension4: stockState === STOCK_STATE.OUT_OF_STOCK ? 'Long Time' : calcWeeks(deliveryLeadTime), // delivery time, values: 0-1 week, 1-2 weeks, 2-3 weeks, etc..
    quantity: Math.abs(qty), // amount of units being checked out , Or amount of units adding to cart(Or removing from cart).
    metric1: isSale ? originalDiscountAmount : '', // amount of discount if applicable, if not leave empty string
    ...(!!quantityDifference && { metric2: (qty * originalPrice).toFixed(2) }), // for cart, increased/decreased amount
  };
}
export function getProductsNeedTracking(lineItems, quantityDifference) {
  return lineItems.map((item) => getProductNeedTracking(item, quantityDifference));
}

export function getPDPCurrentMainVariant(nextState) {
  const { productOptions, products } = nextState;
  const { productSlug } = productOptions;
  const product = products[productSlug]?.data;
  if (product) {
    return product;
  }
  return null;
}

export function getPDPCurrentVariant(nextState) {
  const { productOptions, products } = nextState;
  const { variantId, productSlug } = productOptions;
  const { variants } = products[productSlug]?.data || {};
  if (variants) {
    const targetVariant = variants.find((variant) => variant.id === variantId);
    return targetVariant;
  }
  return null;
}

/* For Klaviyo */
export function getCheckoutUrl() {
  return `${__ONE_PIECE_WEB_SERVER_NAME__}${__BASE_ROUTE__ + getUrl('checkout-account')}`;
}
export function getProductUrl(variant, productSlug) {
  return `${__ONE_PIECE_WEB_SERVER_NAME__}${__BASE_ROUTE__ + getVariantLink(variant, productSlug)}`;
}

export function getProductImageUrl(images) {
  if (!images) return '';
  return images[0]?.links?.medium || images[0]?.links?.large || '';
}
export function getItemsForKlaviyo(lineItems) {
  if (!lineItems) {
    return [];
  }
  return lineItems.map((item) => {
    const { quantity, variant } = item;
    const {
      id,
      sku,
      price,
      product_taxons: productTaxons,
      images,
      product_slug: productSlug,
      product_name: productName,
    } = variant;
    const [pageName, subPageName] = getBreadcrumbNames(productTaxons);

    return {
      ProductID: id,
      SKU: sku,
      ProductName: productName,
      Quantity: quantity,
      ItemPrice: +price,
      RowTotal: price * quantity,
      ProductURL: getProductUrl(variant, productSlug),
      ImageURL: getProductImageUrl(images),
      ProductCategories: [pageName, subPageName],
    };
  });
}

/**
 * @description get cart shipping event label
 * @param {String} type
 * @returns
 */
export function getCartShippingLabel(type) {
  const { pathname = '' } = window?.location || {};
  let label = '';
  switch (type) {
    case 'CART':
      if (pathname.includes('/cart') && !ModalState.states?.includes('cart')) {
        label = 'Fullcart';
      } else {
        label = 'Minicart';
      }
      break;
    case 'PRODUCT':
      if (pathname.includes('/product')) {
        label = 'PDP';
      } else {
        label = 'PLA';
      }
      break;
    case 'CATEGORY':
      label = 'Quickship';
      break;
    case 'OTHER':
      if (pathname.includes('/checkout/shipping-address')) {
        label = 'Ordersummary';
      } else {
        label = 'Other';
      }
      break;
    default:
      label = 'Other';
      break;
  }
  return label;
}
