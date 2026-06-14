/* eslint-disable camelcase */
import {
  currency,
  isProd,
  enableCAPIV2,
  enabledTrackProductViewedMoreThan3,
  enabledIntegrationUTTByCode,
} from 'config';
import { getRecommendationContext, setCurrentContext, revertLastContext } from 'utils/dy';
import { get as getUserCity } from 'utils/trackingLocation';
import ApiClient from 'helpers/ApiClient';
import { get } from 'helpers/Cookie';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import { getOriginalAmount } from 'utils/track/common';
import * as Cookies from 'helpers/Cookie';
import { CookieNames, LocalStorageNames } from 'config/storage-name';
import { randomId } from './number';
import { getFbUserInLocalStorage, getFbcFromLocal } from './facebook';
import { ipv4ToIpv6Full } from './ip';
import { checkConsentGranted } from './consent/consent';

export const CONVERSION_TRACKING_CONSENT_CATEGORIES = ['advertisement', 'analytics'];

const client = new ApiClient();

/**
 *
 * Wrap dy to allow server side rendering
 */

export function dy(...res) {
  if (typeof DY !== 'undefined' && DY.API) {
    DY.API(...res);
  }
}

const formatPinterestData = (data = {}) => {
  // format data
  const eventNameEnum = {
    // facebook event to pinterest event
    ViewContent: 'page_visit',
    AddToCart: 'add_to_cart',
    CompleteRegistration: 'signup',
    Purchase: 'checkout',
    // NewCustomerPurchase: 'checkout',
    Lead: 'lead',
  };

  // user_data backend will be covered if login
  const userData = data.user_data && {
    ...(data.user_data || {}),
    fbc: undefined,
    fbp: undefined,
    em: data.user_data.em && [encHex.stringify(sha256(data.user_data.em))],
    ct: data.user_data.ct && [encHex.stringify(sha256(data.user_data.ct))],
    st: data.user_data.st && [encHex.stringify(sha256(data.user_data.st))],
    zp: data.user_data.zp && [encHex.stringify(sha256(data.user_data.zp))],
    country: data.user_data.country && [encHex.stringify(sha256(data.user_data.country))],
  };

  const custom_data_contents =
    data.custom_data?.contents &&
    data.custom_data.contents.map((content) => ({
      item_price: content.item_price,
      quantity: content.quantity,
    }));

  const custom_data = data.custom_data && {
    value: data.custom_data.value === undefined ? undefined : `${data.custom_data.value}`,
    currency: data.custom_data.currency,
    content_ids: data.custom_data.content_ids,
    contents: custom_data_contents,
    num_items: data.custom_data.num_items,
    order_id: data.custom_data.order_id,
    search_string: data.custom_data.search_string,
  };

  const params = {
    event_name: eventNameEnum[data?.event_name] || 'custom',
    event_id: data.event_id,
    event_time: data.event_time,
    event_source_url: data.event_source_url,
    custom_data,
    user_data: userData,
    action_source: 'web',
  };
  return params;
};

/**
 * Pinterest conversion api
 */
export function ptConversion(data = {}, { header, formatData = true }) {
  if (!__PINTEREST_ENABLED__) {
    return;
  }
  if (!checkConsentGranted(CONVERSION_TRACKING_CONSENT_CATEGORIES)) {
    console.error('Conversion tracking consent not granted', CONVERSION_TRACKING_CONSENT_CATEGORIES);
    return;
  }
  const params = formatData ? formatPinterestData(data) : data;
  // if (globalFeatureInUS || globalFeatureInAU || globalFeatureInCA || globalFeatureInUK) {
  const gaPersudoId = Cookies.get('_ga');
  if (gaPersudoId) {
    if (params.user_data === undefined) {
      params.user_data = {};
    }
    params.user_data.external_id = [encHex.stringify(sha256(gaPersudoId.slice(6) || ''))];
  }
  // }
  const apiUrl = isProd ? '/pinterest/conversion' : '/pinterest/conversion?test=true';
  client
    .post(apiUrl, {
      header,
      auth: 'loose',
      data: params,
    })
    .catch((error) => {
      console.log('🚀 ~ file: tracking.js:105 ~ ptConversion ~ error:', error);
    });
}
/**
 * add facebook server to server tracking
 * @Remark If you modify the parameter, please check whether the Pinterest is supported
 */
function fbs({ event_id, event_name, event_time, custom_data, accessToken, zipCode, disablePlatforms = [] }) {
  if (!checkConsentGranted(CONVERSION_TRACKING_CONSENT_CATEGORIES)) {
    console.error('Conversion tracking consent not granted', CONVERSION_TRACKING_CONSENT_CATEGORIES);
    return;
  }
  const _fbc = getFbcFromLocal();
  const _fbp = get('_fbp');
  const { ip_address, country_code, city, region_code, zip_code } = getUserCity();
  const fbUser = getFbUserInLocalStorage();
  const fbLoginId = fbUser?.[LocalStorageNames.fbLoginId];
  const data = {
    event_id,
    event_name,
    event_time,
    event_source_url: window?.location.href,
    // user_data backend will be covered if login
    user_data: {
      fbc: _fbc,
      fbp: _fbp,
      client_ip_address: ip_address ? ipv4ToIpv6Full(ip_address) : '',
      client_user_agent: navigator.userAgent,
      country: country_code ? country_code.toLowerCase() : undefined,
      ct: city ? city.toLowerCase() : undefined,
      st: region_code ? region_code.toLowerCase() : undefined,
      zp: zipCode || zip_code || undefined,
      fb_login_id: fbLoginId || undefined,
    },
    custom_data,
    action_source: 'website',
  };
  // signUp event need to send accessToken
  const header = accessToken ? { 'X-Access-Token': accessToken } : {};

  if (!disablePlatforms || !disablePlatforms.includes('facebook')) {
    client
      .post('/facebook/conversion', {
        header,
        auth: 'loose',
        data,
      })
      .catch((error) => {
        console.log('🚀 ~ file: tracking.js:146 ~ fbs ~ error:', error);
      });
    if (enableCAPIV2) {
      const user_data = data.user_data;
      user_data.country = user_data.country ? encHex.stringify(sha256(`${user_data.country}`)) : undefined;
      user_data.ct = user_data.ct ? encHex.stringify(sha256(`${user_data.ct}`)) : undefined;
      user_data.st = user_data.st ? encHex.stringify(sha256(`${user_data.st}`)) : undefined;
      user_data.zp = user_data.zp ? encHex.stringify(sha256(`${user_data.zp}`)) : undefined;
      user_data.fb_login_id = user_data.fb_login_id ? encHex.stringify(sha256(`${user_data.fb_login_id}`)) : undefined;
      const newData = {
        ...data,
        custom_data:
          Object.keys(custom_data).length !== 0
            ? Object.assign(custom_data, {
                delivery_category: 'home_delivery',
              })
            : {
                delivery_category: 'home_delivery',
              },
        user_data,
        pixel_id: __CAPI_PIXEL_ID__,
      };
      client
        .post('/v2/facebook/conversion', {
          header,
          auth: 'loose',
          data: newData,
        })
        .catch((error) => {
          console.log('🚀 ~ file: tracking.js:170 ~ fbs ~ error:', error);
        });
    }
  }
  if (!disablePlatforms || !disablePlatforms.includes('pinterest')) {
    ptConversion(data, { header });
  }
}

/**
 *
 * Wrap facebook pixel to allow server side rendering
 * @param {string} eventName
 * @param {object} eventData
 * @param {object} (eventId, accessToken, zipCode) - optional
 *
 */
export function fbp(...res) {
  const eventName = res[1];
  const eventData = res[2];
  let { eventId } = res[3] || {};
  // disablePlatforms is used to disable some platforms
  const { accessToken, zipCode, disablePlatforms } = res[3] || {};
  const now = new Date();
  // eslint-disable-next-line no-bitwise
  const eventTime = (now.getTime() / 1000) | 0;
  if (!eventId) eventId = randomId(`${eventName || ''}`);
  fbs({
    event_id: eventId,
    event_name: eventName,
    event_time: eventTime,
    custom_data: eventData,
    accessToken,
    zipCode,
    disablePlatforms,
  });
}

/**
 *
 * Wrap podcast pixel to allow server side rendering
 */

export function pqst(eventName, data) {
  if (typeof pdst !== 'undefined') {
    pdst(eventName, data);
  }
}

/**
 *
 * Freshchat
 *
 */

export function freshchat(type, ...params) {
  if (typeof fcWidget !== 'undefined') {
    if (type === 'track') {
      fcWidget.track(...params);
    } else if (type === 'setuser') {
      fcWidget.user.setProperties(...params);
    }
  }
}

/**
 * track pageview =>  pinterest
 */

export function trackPageView(result = {}) {
  const { productPrice, productCode, pageCat, eventId } = result;
  // eslint-disable-next-line no-unused-vars
  const { ip_address, country_code, city, region_code, zip_code } = getUserCity();
  const now = new Date();
  // eslint-disable-next-line no-bitwise
  const eventTime = (now.getTime() / 1000) | 0;

  const user_data = {
    client_ip_address: ip_address,
    client_user_agent: navigator.userAgent,
    ct: city && [encHex.stringify(sha256(city?.toLowerCase()))],
    st: region_code && [encHex.stringify(sha256(region_code?.toLowerCase()))],
    zp: zip_code && [encHex.stringify(sha256(zip_code))],
    country: country_code && [encHex.stringify(sha256(country_code?.toLowerCase()))],
  };

  const custom_data =
    pageCat === 'product-detail'
      ? {
          currency: __CURRENCY__,
          value: productPrice && `${productPrice}`,
          content_ids: productCode && [productCode],
          num_items: 1,
        }
      : undefined;

  const params = {
    event_name: 'page_visit',
    action_source: 'web',
    event_time: eventTime,
    event_id: eventId,
    event_source_url: window?.location.href,
    user_data,
    custom_data,
  };
  ptConversion(params, { formatData: false });
}

/**
 *
 *  Track Payment
 *
 */

export function trackPayment(result, method) {
  // add fbp add payment tracking
  fbp('track', 'AddPaymentInfo', {
    value: result.total,
    currency,
    content_ids: result.line_items.map((i) => i.variant.sku),
  });
}

/**
 *
 * Track Purchase
 *
 */

export const trackPurchase = ({ order, eventId }) => {
  // track ga purchase event
  // exclude swatch from purchase event
  const rtbPromise = Promise.resolve();
  const swatches = order.line_items.filter((lineItem) => lineItem.is_swatch);
  const products = order.line_items.filter((lineItem) => !lineItem.is_swatch);
  const trackedOrder = {
    ...order,
    line_items: products,
    item_count: order.item_count - swatches.length,
  };

  const { zipcode } = trackedOrder;

  if (swatches.length > 0) {
    fbp('trackCustom', 'SwatchPurchase', {
      content_category: 'Swatch',
      content_ids: swatches.map((swatch) => swatch.variant.sku),
      content_type: 'swatch',
    });

    dy('event', {
      name: 'Swatch Purchase',
      properties: {
        'Swatch SKUs': `${swatches.map((swatch) => swatch.variant.sku).join(', ')}`,
      },
    });
  }

  if (products.length > 0) {
    dy('event', {
      name: 'Purchase',
      properties: {
        uniqueTransactionId: trackedOrder.number,
        dyType: 'purchase-v1',
        value: trackedOrder.total,
        currency: trackedOrder.currency,
        cart: trackedOrder.line_items.map((item) => ({
          productId: item.variant.sku,
          quantity: item.quantity,
          itemPrice: item.variant.price,
        })),
      },
    });

    const contents = trackedOrder.line_items?.map((item) => ({
      id: item.variant.sku,
      quantity: item.quantity,
      item_price: item.variant.price,
    }));

    // track fbp purchase event
    if (order.first_purchase) {
      const newEventId = eventId && `New_${eventId}`; // This needs to be consistent with GTM
      fbp(
        'trackCustom',
        'NewCustomerPurchase',
        {
          value: trackedOrder.total,
          currency,
          content_ids: trackedOrder.line_items.map((i) => i.variant.sku),
          content_type: 'product',
          // num_items: trackedOrder.item_count, // facebook only surport in InitiateCheckout
          contents,
          order_id: trackedOrder.number,
        },
        { eventId: newEventId, zipCode: zipcode }
      );
    }
    fbp(
      'track',
      'Purchase',
      {
        value: trackedOrder.total,
        currency,
        content_ids: trackedOrder.line_items.map((i) => i.variant.sku),
        content_type: 'product',
        // num_items: trackedOrder.item_count, // facebook only surport in InitiateCheckout
        contents,
        order_id: trackedOrder.number,
      },
      { eventId, zipCode: zipcode }
    );

    /**
     * Platform needs (trigger initiate checkout event when purchase)
     * Please see Jamie if you have any questions.
     */
    const initiateCheckoutEventId = eventId && `InitiateCheckout_${eventId}`; // This needs to be consistent with GTM
    fbp(
      'track',
      'InitiateCheckout',
      {
        value: trackedOrder.total,
        currency,
        content_ids: trackedOrder.line_items.map((i) => i.variant.sku),
        content_type: 'product',
        num_items: trackedOrder.item_count, // facebook only surport in InitiateCheckout
        // contents,
        // order_id: trackedOrder.number,
      },
      { eventId: initiateCheckoutEventId, zipCode: zipcode, disablePlatforms: ['pinterest'] }
    );

    pqst('purchase', {
      value: trackedOrder.total,
      currency,
      discount_code: trackedOrder.coupon?.code,
      order_id: trackedOrder.number,
      quantity: trackedOrder.item_count,
      is_new_customer: trackedOrder.first_purchase,
      line_items: trackedOrder.line_items.map((item) => ({
        value: item.amount,
        quantity: item.quantity,
        product_id: item.variant.product_id,
        product_name: item.variant.product_name,
        product_type: item.variant.product_taxons?.find(
          (taxon) => taxon.level === 1 && taxon.ancestors.includes('Category')
        )?.name,
        variant_id: item.variant.sku,
        variant_name: item.variant.name,
      })),
    });
  }
  // fix RTB Order Mismatch, WW-924
  return rtbPromise;
};

export function trackCartOperation({
  variant,
  quantity,
  isIncreased,
  price,
  listName,
  listPosition,
  isSwatch,
  swatchRelatedProduct,
  cart,
  preCart,
  eventId,
}) {
  if (variant.id) {
    // add 0 at the end in case variant.price is undefined for swatch
    const priceFormatted = +price || +variant.price || 0;
    if (isSwatch) {
      if (isIncreased) {
        fbp('trackCustom', 'SwatchATC', {
          content_category: 'Swatch',
          content_ids: [variant.sku],
          content_name: variant.name,
          related_product_id: swatchRelatedProduct.id,
        });
        dy('event', {
          name: 'Swatch ATC',
          properties: {
            'Swatch Name': variant.name,
            'Swatch SKU': variant.sku,
            'Related Product': swatchRelatedProduct.slug,
          },
        });
      }
    } else {
      dy('event', {
        name: isIncreased ? 'Add to Cart' : 'Remove from Cart',
        properties: {
          dyType: isIncreased ? 'add-to-cart-v1' : 'remove-from-cart-v1',
          value: priceFormatted * quantity,
          currency: __CURRENCY__,
          productId: variant.sku,
          quantity,
          cart: cart.line_items
            .filter((item) => !item.is_swatch)
            .map((item) => ({
              productId: item.variant.sku,
              quantity: item.quantity,
              itemPrice: item.variant.price,
            })),
        },
      });

      if (isIncreased) {
        const originalValue = getOriginalAmount(priceFormatted || 0);
        fbp(
          'track',
          'AddToCart',
          {
            value: originalValue,
            currency: __CURRENCY__,
            content_name: variant.name,
            content_ids: [variant.sku],
            content_type: 'product',
          },
          { eventId }
        );

        const [lineItem] = cart.line_items.slice(-1);
        const currentVariant = lineItem?.variant;
        pqst('addtocart', {
          value: priceFormatted,
          currency: __CURRENCY__,
          quantity,
          product_id: variant.product_id,
          product_name: variant.product_name,
          product_type: currentVariant?.product_taxons?.find(
            (taxon) => taxon.level === 1 && taxon.ancestors.includes('Category')
          )?.name,
          variant_id: variant.sku,
          variant_name: variant.name,
        });
      }
    }
  }
}

export function trackAddToWishList(variant, { eventId }) {
  dy('event', {
    name: 'Add to Wishlist',
    properties: {
      dyType: 'add-to-wishlist-v1',
      productId: variant.sku,
    },
  });

  fbp(
    'track',
    'AddToWishlist',
    {
      value: +variant.price,
      content_name: variant.name,
      content_ids: [variant.sku],
      currency: __CURRENCY__,
    },
    { eventId }
  );
}

export function trackDYSubscription(email) {
  if (email && typeof DYO !== 'undefined') {
    dy('event', {
      name: 'Newsletter Subscription',
      properties: {
        dyType: 'newsletter-subscription-v1',
        hashedEmail: DYO.dyhash.sha256(email.toLowerCase()),
      },
    });
  }
}

export function trackSubscription(email, { eventId }) {
  fbp(
    'track',
    'CompleteRegistration',
    {
      value: 0.0,
      currency: __CURRENCY__,
      content_name: 'Subscription Footer',
    },
    { eventId }
  );
  trackDYSubscription(email);
}

export function trackDYSignup(user) {
  if (user.email && typeof DYO !== 'undefined') {
    dy('event', {
      name: 'Signup',
      properties: {
        dyType: 'signup-v1',
        hashedEmail: DYO.dyhash.sha256(user.email.toLowerCase()),
      },
    });
  } else if (user.id) {
    dy('event', {
      name: 'Signup',
      properties: {
        dyType: 'signup-v1',
        cuid: user.id,
      },
    });
  }
}

export function trackSignUp(user, { eventId, accessToken }) {
  fbp(
    'track',
    'CompleteRegistration',
    {
      value: 0.0,
      currency: __CURRENCY__,
      content_name: 'Sign Up',
    },
    { eventId, accessToken }
  );
  trackDYSignup(user);
}

export function trackAppointment({ eventLabel, pixelName, appointment, customer }) {
  fbp('trackCustom', 'EventSignUp', {
    content_name: pixelName,
  });

  // freshchat
  freshchat('track', 'book-appointment', appointment);
  freshchat('setuser', {
    email: customer.email,
    phone: customer.phone_number,
  });
}

export function trackSignUpNewsletter(email) {
  /* record signup newsletter event */

  fbp('track', 'CompleteRegistration', {
    value: 0.0,
    currency: __CURRENCY__,
    content_name: 'Subscription Popup',
  });
  trackDYSubscription(email);
}

export function trackViewProduct({ variant, currency, categoryName, eventId }) {
  const originalValue = getOriginalAmount(variant.price || 0);
  fbp(
    'track',
    'ViewContent',
    {
      value: originalValue,
      currency,
      content_name: variant.name,
      content_ids: [variant.sku],
      content_type: 'product',
    },
    { eventId }
  );

  pqst('product', {
    value: variant.price,
    currency,
    product_id: variant.product_id,
    product_name: variant.product_name,
    product_type: categoryName || '',
  });
}

export function trackClickCheckout({ order, currency, value, eventId }) {
  fbp(
    'track',
    'InitiateCheckout',
    {
      value: value || order?.item_total,
      currency,
      content_type: 'product',
      content_ids: order.line_items.map((i) => i.variant.sku),
      num_items: order.item_count,
    },
    // not trigger facebook event
    { eventId, disablePlatforms: ['facebook'] }
  );

  pqst('checkout', {
    value: order.total,
    currency,
    discount_code: order.coupon?.code,
    quantity: order.item_count,
    line_items: order.line_items.map((item) => ({
      value: item.amount,
      quantity: item.quantity,
      product_id: item.variant.product_id,
      product_name: item.variant.product_name,
      product_type: item.variant.product_taxons?.find(
        (taxon) => taxon.level === 1 && taxon.ancestors.includes('Category')
      )?.name,
      variant_id: item.variant.sku,
      variant_name: item.variant.name,
    })),
  });
}

export function setFreshchatUser(user) {
  if (user?.email) {
    freshchat('setuser', {
      firstName: user.firstname,
      email: user.email,
    });
  }
}

export function trackDYKeywordSearch(keywords) {
  dy('event', {
    name: 'Keyword Search',
    properties: {
      dyType: 'keyword-search-v1',
      keywords,
    },
  });
}

export function trackCouponAdded(result) {
  if (result && result.coupon && result.coupon.code) {
    dy('event', {
      name: 'Promo Code Entered',
      properties: {
        dyType: 'enter-promo-code-v1',
        code: result.coupon.code,
      },
    });
  }
}

export function trackFilterItems(type, value) {
  dy('event', {
    name: 'Filter Items',
    properties: {
      dyType: 'filter-items-v1',
      filterType: type,
      filterStringValue: value,
    },
  });
}

export function setSPAContext(context, countAsPageView = true) {
  if (countAsPageView !== false) {
    setCurrentContext(context);
  }
  dy('spa', {
    context,
    countAsPageView,
  });
}

export function trackSPAEvent(data) {
  setSPAContext(getRecommendationContext(data), data.countAsPageView);
}

export function trackLastSPAContext() {
  setSPAContext(revertLastContext());
}
export function trackUttCustomer(user) {
  if (enabledIntegrationUTTByCode && typeof window?.ire !== 'undefined') {
    window.ire('identify', {
      customerId: user?.id ?? '',
      customerEmail: user?.emailHashed ?? '',
    });
  }
}

export function trackCustomer(user) {
  const { id, email } = user;

  // setDatadogUser(user);
  trackUttCustomer(user);
  setFreshchatUser(user);
  // DY tracking
  if (email && typeof DYO !== 'undefined') {
    dy('event', {
      name: 'Login',
      properties: {
        dyType: 'login-v1',
        hashedEmail: DYO.dyhash.sha256(email.toLowerCase()),
      },
    });
  } else if (id) {
    dy('event', {
      name: 'Login',
      properties: {
        dyType: 'login-v1',
        cuid: id,
      },
    });
  }
}

/**
 * @remark https://app.clickup.com/t/86etxghr6
 * @param {*} product
 * @returns
 */
export function trackProductViewedMoreThanThreeTimes() {
  if (!enabledTrackProductViewedMoreThan3) {
    return;
  }
  // pdpViewedCountPerSession is a cookie that is set when the user views a product page by GTM script
  // trackProductViewedMoreThanThreeTimes 需要在pageview后调用，因为pdpViewedCountPerSession是pageview后设置的
  const pdpViewedCountPerSession = Cookies.get(CookieNames.pdpViewedCountPerSession);
  if (pdpViewedCountPerSession) {
    const pdpViewedCountPerSessionInt = parseInt(pdpViewedCountPerSession);
    if (pdpViewedCountPerSessionInt === 4) {
      fbp('trackCustom', 'Product_page_view_more_than_3', {});
    }
  }
}
