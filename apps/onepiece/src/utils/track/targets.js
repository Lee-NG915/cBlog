import config from 'config';
import { TARGET_GTM, TARGET_KLAVIYO } from './constants';

export function gtmTarget({ _event, ...params }) {
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
    pageVariant: null,

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

  if (!config.enableUnifiedDataLayer) {
    if (typeof oldGtmDataLayer !== 'undefined') {
      if (_event === 'pageview') {
        window.oldGtmDataLayer.push(pageViewReset);
      } else {
        window.oldGtmDataLayer.push(ecommerceReset);
      }
      window.oldGtmDataLayer.push({ event: _event, ...params });
    }
  }
}

export function klaviyoTarget(data) {
  if (typeof _learnq !== 'undefined') {
    _learnq.push(data.data);
  }
}

export default {
  [TARGET_GTM]: gtmTarget,
  [TARGET_KLAVIYO]: klaviyoTarget,
};
