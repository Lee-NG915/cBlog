import { INTL_CURRENCY, EcEnv, WEB_PAGE_BASIC_PARAMS, WEB_PAGE_NAMES } from '@castlery/config';
import { getEventRandomId } from '../utils';
import { getBreadcrumbNames, getOriginalAmount } from './product.helper';
import { getCartValuesByOrder } from './order.helper';

export const defaultEcommerceParameters = {
  ecommerce: null,
  eventDetails: null,
  transactionId: null,
  transactionId2: null,
  transactionTotalsh: null,
  transactionTotal: null,
  transactionTotalNet: null,
  transactionDiscount: null,
  transactionCoupon: null,
  transactionPromo: null,
  transactionTax: null,
  transactionShipping: null,
  transactionCountry: null,
};

export const defaultCommonParameters = {
  pageCat: null,
  pageType: null,
  pageContent: null,
  pageProduct: null,
  pageCountry: EcEnv.NEXT_PUBLIC_COUNTRY,
  currencyCode: INTL_CURRENCY,
  pageVariant: null,
  userID: null,
  userType: null, // member or guest
  userStatus: null, // logged-in or logged-out
  userEmail: null,
  userPhone: null,
  isNewCustomer: false,
  productCode: null, // variants[0].sku
  productName: null, // variants[0].name
  productPrice: null, // product unit price, no commas, excl tax => getOriginalAmount(price)
  productSale: null, // 'sale' if reduced price; 'full' if standard price , isSale ? 'sale' : 'full'
  //==================== order parameters ==============
  cartValue: null,
  cartValueNet: null,
};

export const defaultPageViewParameters = {
  event: 'pageview',
  eventId: getEventRandomId('Pageview'),
  ...defaultCommonParameters,
};

export const getPageViewPageSettings = (pageName: string) => {
  const data = {
    pageCat: '',
    pageType: '',
    pageContent: '',
    pageProduct: '',
  };
  if (!pageName) {
    return data;
  }
  const defaultPageSettings = WEB_PAGE_BASIC_PARAMS[pageName] || data;
  return {
    ...defaultPageSettings,
  };
};

export function getPageViewParams({
  pathname,
  pageName,
  pageVariant,
  customer,
  order,
  product,
  variant,
  customPageProduct,
  customPageContent,
  customPagePermalink,
}: {
  pathname: string;
  pageName: string;
  pageVariant: string;
  customer: any;
  order: any;
  product: any;
  variant: any;
  customPageProduct?: string;
  customPageContent?: string;
  customPagePermalink?: string;
}) {
  let { pageCat, pageType, pageContent, pageProduct } = getPageViewPageSettings(pageName);
  if (customPageProduct) {
    pageProduct = customPageProduct;
  }
  if (customPageContent) {
    pageContent = customPageContent;
  }
  let isNewCustomer: boolean | string = '';
  let page;
  let routeSegment;
  let otherParams = {};
  if (order) {
    isNewCustomer = order.first_purchase;
  }

  switch (pageName) {
    case WEB_PAGE_NAMES.SEO_PAGE:
      pageProduct = customPagePermalink ?? '';
      break;
    case WEB_PAGE_NAMES.PRODUCT_DETAIL_PAGE:
      if (product) {
        const { taxons, variants } = product;
        const targetVariant = variant ?? variants?.[0];
        if (targetVariant) {
          const { sku, name, price, list_price: listPrice } = targetVariant;
          const isSale = listPrice - price > 0;
          [pageContent, pageProduct] = getBreadcrumbNames(taxons);
          otherParams = {
            productCode: sku,
            productName: name,
            productPrice: getOriginalAmount(price),
            productSale: isSale ? 'sale' : 'full',
          };
        }
      }
      break;

    case WEB_PAGE_NAMES.CART_PAGE:
      if (order) {
        const cartValues = getCartValuesByOrder(order);
        otherParams = {
          ...otherParams,
          ...cartValues,
        };
      }
      break;
    case WEB_PAGE_NAMES.CHECKOUT_PAGE:
      if (pathname.endsWith('success')) {
        pageCat = 'checkout';
        pageType = 'checkout';
        pageContent = 'checkout-confirm';
      } else {
        pageCat = 'checkout';
        pageType = 'checkout';
        pageContent = 'checkout';
      }
      if (order) {
        const cartValues = getCartValuesByOrder(order);
        otherParams = {
          ...otherParams,
          ...cartValues,
        };
      }

      break;
    case WEB_PAGE_NAMES.SHOP_THE_LOOK_PAGE:
      routeSegment = pathname.split('/').pop();
      if (routeSegment === 'by-collection') {
        pageCat = 'collection';
        pageContent = 'collection';
        pageProduct = 'collection';
      } else if (['living-room', 'dining-room', 'bedroom', 'outdoor'].includes(routeSegment || '')) {
        pageCat = 'room';
        pageContent = customPageContent ?? routeSegment ?? '';
        pageProduct = customPageProduct ?? routeSegment ?? '';
      }
      break;
    default:
  }
  //   let pageVariant = '';
  //   if (isPLAPage) {
  //     const variant = getCookie('X-Exp-PlaLayout');
  //     pageVariant = variant ? `pla-layout-${variant}` : '';
  //   }
  return {
    pageCat,
    pageType,
    pageContent,
    pageProduct,
    pageCountry: EcEnv.NEXT_PUBLIC_COUNTRY,
    currencyCode: INTL_CURRENCY,
    pageVariant: pageVariant ?? '', // 页面变体，在新web中页面可能存在变体
    userID: customer ? customer.id : '',
    userType: customer ? 'member' : 'guest',
    userStatus: customer ? 'logged-in' : 'logged-out',
    userEmail: customer?.emailHashed || '',
    userPhone: customer?.phoneHashed || '',
    isNewCustomer,
    ...otherParams,
  };
}
