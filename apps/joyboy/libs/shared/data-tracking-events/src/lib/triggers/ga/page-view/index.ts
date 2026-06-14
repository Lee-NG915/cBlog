import { GaMetrics } from '../../../metrics';
import type { Customer } from '../../../types';
import { __COUNTRY__, __CURRENCY__ } from '../../../config';

export interface PageViewDataLayer {
  event: GaMetrics.pageview;
  pageCat: string;
  pageType: string;
  pageContent: string;
  pageProduct: string;
  pageCountry: string;
  pageUrl: string;
  pageVariant: string;
  currencyCode: string;
  userID: number | '';
  isNewCustomer: boolean | '';
  userType: 'member' | 'guest' | '';
  userStatus: 'logged-in' | 'logged-out' | '';
  userEmail: string;
  userPhone: string;
  cartValue?: number | '';
  cartValueNet?: string;
  productCode?: string;
  productName?: string;
  productPrice?: number | '';
  productSale?: 'sale' | 'full' | '';
}

export const resetPageViewDataLayer: PageViewDataLayer = {
  event: GaMetrics.pageview,
  pageCat: '',
  pageType: '',
  pageContent: '',
  pageProduct: '',
  pageCountry: '',
  pageUrl: '',
  pageVariant: '',
  currencyCode: '',
  userID: '',
  isNewCustomer: '',
  userType: '',
  userStatus: '',
  userEmail: '',
  userPhone: '',
  cartValue: '',
  cartValueNet: '',
  productCode: '',
  productName: '',
  productPrice: '',
  productSale: '',
};

export const basePageViewTrigger = (args: {
  customer: Customer | null;
  details: Partial<PageViewDataLayer>;
}): PageViewDataLayer => {
  const { customer, details } = args;
  return {
    ...resetPageViewDataLayer,
    pageCountry: __COUNTRY__,
    currencyCode: __CURRENCY__ || '',
    userID: customer?.id || '',
    userType: customer ? 'member' : 'guest',
    userStatus: customer ? 'logged-in' : 'logged-out',
    userEmail: customer?.emailHashed || '',
    userPhone: customer?.phoneHashed || '',
    ...details,
  };
};

/**
 * export function gtmTarget({ _event, ...params }) {
  const ecommerceReset = {
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
  const pageViewReset = {
    pageCat: null,
    pageType: null,
    pageContent: null,
    pageProduct: null,
    pageCountry: null,
    currencyCode: null,
    userID: null,
    userType: null,
    userStatus: null,
    userEmail: null,
    userPhone: null,

    cartValue: null,
    cartValueNet: null,
    productCode: null,
    productName: null,
    productPrice: null,
    productSale: null,

    ...ecommerceReset,
  };

  if (typeof dataLayer !== 'undefined') {
    if (_event === 'pageview') {
      window.dataLayer.push(pageViewReset);
    } else {
      window.dataLayer.push(ecommerceReset);
    }
    window.dataLayer.push({ event: _event, ...params });
  }

  if (typeof oldGtmDataLayer !== 'undefined') {
    if (_event === 'pageview') {
      window.oldGtmDataLayer.push(pageViewReset);
    } else {
      window.oldGtmDataLayer.push(ecommerceReset);
    }
    window.oldGtmDataLayer.push({ event: _event, ...params });
  }
}
 */
