/* eslint-disable no-unsafe-optional-chaining */
import { getPageByUrl, getUrl, removeKnightPrefix } from 'pages';
import {
  trackViewProduct,
  trackPageView,
  trackSignUp,
  trackPurchase,
  trackClickCheckout,
  trackProductViewedMoreThanThreeTimes,
} from 'utils/tracking';
import { getDate } from 'utils/time';
import { randomId } from 'utils/number';
import { getCurrentContext } from 'utils/dy';
import { reportClickEngagement, reportRecommendationsEngagement } from 'utils/dyReporting';
import { currency } from 'config';
import { get } from 'helpers/Cookie';
import storyblokEventsMap from './storyblokEventsMap';
import cartEventsMap from './cartEventsMap';

import {
  findBrand,
  getBreadcrumbNames,
  getOriginalAmount,
  getPageViewParams,
  getLastPageView,
  getProductNeedTracking,
  getProductsNeedTracking,
  getApproximateTax,
  getPDPCurrentVariant,
  getCartShippingLabel,
  getPDPCurrentMainVariant,
} from './common';
import {
  EVENT_ADD_TO_WISHLIST,
  EVENT_CART_PROCESS,
  EVENT_CHECKOUT,
  EVENT_FORM_SUBMIT,
  EVENT_PAGE_VIEW,
  EVENT_PRODUCT_CLICK,
  EVENT_PRODUCT_DETAIL,
  EVENT_PRODUCT_FILTER,
  EVENT_PRODUCT_IMPRESSION,
  EVENT_PRODUCT_SORT,
  EVENT_SIGN_IN,
  EVENT_SIGN_UP,
  EVENT_TRANSACTION,
  EVENT_VIDOE_PROGRESS,
  EVENT_PDP_IMAGE_IMPRESSION,
  EVENT_PDP_IMAGE_DURATION,
  EVENT_PDP_DETAILS,
  EVENT_PDP_REVIEW_SECTION,
  EVENT_PDP_CONFIG,
  EVENT_PDP_ROOM_DESIGNER,
  EVENT_MODEL_LOAD_TIME,
  EVENT_START_AR,
  EVENT_DY_EVENT,
  EVENT_MULBERRY_WARRANTY,
  EVENT_SHOP_THE_LOOK,
  EVENT_IDENTIFY,
  EVENT_LONG_LEAD_TIME,
  EVENT_LINK_CLICK,
  EVENT_ADD_COUPON,
  EVENT_SEARCH_ADDRESS,
  EVENT_ADD_ADDRESS,
  EVENT_SOCIAL_WIDGET,
  EVENT_CART_RECO,
  EVENT_SHIPPING_PREFERENCE,
  EVENT_ASSEMBLY_PREFERENCE,
  EVENT_SHIPPING_SERVICE_TYPE,
  EVENT_SELECT_PAYMENT_METHOD,
  EVENT_CONTACT_FORM_FILLUP,
  EVENT_INITIATE_CHAT,
  EVENT_SHOWROOM_EXCLUSIVES,
  EVENT_CART_SHIPPING,
  EVENT_RESET_PASSWORD,
  EVENT_DY_AB_TEST,
  EVENT_SHIPPING_ADDRESS_EDIT,
  EVENT_DELIVERY_PERIOD_CLICK,
  EVENT_CLICK_ECO_INFO_ICON,
  EVENT_TOU_POPUP,
  EVENT_PDP_PRODUCT_DETAILS,
  EVENT_PLA_EXPERIMENT,
  EVENT_PRODUCT_PAGE_VIEW_MORE_THAN_3,
  EVENT_TRUSTPILOT_IMPRESSION,
  EVENT_TRUSTPILOT_CLICK,
  EVENT_CASA_TRACK_EVENT,
} from './constants';

/*
  note: Do not moidfy the content of action, preState and nextState directly. Make sure to update in a duplicate of them only.
*/
function pageView(action, preState, nextState) {
  const params = getPageViewParams(action, preState, nextState);
  const eventId = randomId('Pageview');
  trackPageView({ ...params, eventId });
  return {
    _event: 'pageview',
    eventId,
    ...params,
  };
}

function identify(action, preState, nextState) {
  const { auth } = nextState;
  if (auth.user) {
    const { id, email, firstname, lastname } = auth.user;
    /**
     * method for differentiate whether the user has already logged in
     */
    const { method } = action.result || {};
    return {
      _event: 'trackEvent',
      'eventDetails.category': 'Account',
      'eventDetails.action': 'identify',
      'eventDetails.label': `${id}`,
      'eventDetails.method': method,
      'eventDetails.dimension5': email,
      'eventDetails.dimension6': firstname,
      'eventDetails.dimension7': lastname,
    };
  }
  return null;
}

function productImpression(action, preState, nextState) {
  const { tracking } = preState;
  const { impressions } = tracking;
  if (impressions.length < 0) return;
  return {
    _event: 'productImpression',
    ecommerce: {
      currencyCode: __CURRENCY__,
      impressions,
    },
  };
}

function productClick(action, preState, nextState) {
  const { taxons, variant, decisionId, variationId, slotId } = action.result;
  const { name, sku, price } = variant;
  const { pathname } = getLastPageView(nextState.tracking.historyViews);
  const brand = findBrand(taxons);
  const [pageName, subPageName] = getBreadcrumbNames(taxons);
  const page = getPageByUrl(pathname);

  // report click engagement to track of the times user interacts with the default render
  if (slotId) {
    reportRecommendationsEngagement({ slotId });
  } else if (decisionId) {
    reportClickEngagement({ decisionId });
  }
  return {
    _event: 'productClick',
    ecommerce: {
      currencyCode: __CURRENCY__,
      click: {
        actionField: { list: page ? removeKnightPrefix(page.key) : '' },
        products: [
          {
            name,
            id: sku,
            price: getOriginalAmount(price),
            dimension1: pageName,
            category: subPageName,
            brand,
          },
        ],
      },
    },
  };
}
function productSort(action, preState, nextState) {
  const { label } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Product Listings',
    'eventDetails.action': 'Sort Filter',
    'eventDetails.label': label,
  };
}

function productFilter(action, preState, nextState) {
  const { filterKey, label } = action.result;
  const actions = {
    category: 'Category Filter',
    tags: 'Featured Filter',
    lead_time: 'Leaves Warehouse Filter',
    material_filter: 'Material',
    color: 'Color Filter',
    price: 'Price Filter',
    length: 'Length Filter',
    bed_frame_size: 'Bed Frame Size Filter',
    overall_sit_rating: 'Seat Comfort Filter',
    seat_depth_rating: 'Seat Depth Filter',
    seat_height_rating: 'Seat Height Filter',
    seat_softness_rating: 'Seat Softness Filter',
    quickship: 'Quickship Filter',
    fabric_feature: 'Fabric Feature Filter',
    fabric_type: 'Fabric Type Filter',
  };
  if (actions[filterKey]) {
    return {
      _event: 'trackEvent',
      'eventDetails.category': 'Product Listings',
      'eventDetails.action': actions[filterKey],
      'eventDetails.label': label,
    };
  }
}
function productDetail(action, preState, nextState) {
  const { products, productOptions } = nextState;
  const { variantId, productSlug } = productOptions;
  const product = products[productSlug]?.data;
  if (!product) return;
  const variant = product?.variants.find((v) => v.id === variantId);
  const { taxons } = product;
  const { sku, name, price, list_price: listPrice } = variant;
  const originalPrice = getOriginalAmount(price);
  const [pageName, subPageName] = getBreadcrumbNames(taxons);
  const brand = findBrand(taxons);
  const originalDiscountAmount = getOriginalAmount(listPrice - price);
  const isSale = +originalDiscountAmount > 0;
  const eventId = randomId('viewContent');
  // track because of fbp
  trackViewProduct({ variant, currency: __CURRENCY__, pageName, eventId });
  return {
    _event: 'productDetail',
    eventId,
    ecommerce: {
      currencyCode: __CURRENCY__,
      detail: {
        products: [
          {
            id: sku,
            name,
            price: originalPrice,
            category: subPageName,
            brand,
            dimension1: pageName,
            dimension2: '',
            dimension3: isSale ? 'sale' : 'full',
            dimension4: '',
            metric1: isSale ? originalDiscountAmount : '',
          },
        ],
      },
    },
  };
}

function addToWishList(action, preState, nextState) {
  const { variant, eventId } = action.result;
  return {
    _event: 'trackEvent',
    eventId,
    'eventDetails.category': 'Ecommerce',
    'eventDetails.action': 'Wish-list',
    'eventDetails.label': `${variant.sku} | ${variant.name}`,
    currencyCode: __CURRENCY__,
    productName: variant.name,
    productPrice: +variant.price,
    productCode: [variant.sku],
  };
}

function cartProcess(action, preState, nextState) {
  const { isSwatch, variant, preCart, isIncreased, eventId, atc_type } = action.result;
  const { auth, cart } = nextState;
  const { data: nextCart } = cart;
  const { user } = auth;
  // add swatch
  if (isSwatch) {
    if (isIncreased) {
      return {
        _event: 'trackEvent',
        'eventDetails.category': 'Ecommerce',
        'eventDetails.action': 'Swatch - add to cart',
        'eventDetails.label': `${variant.sku} | ${variant.name}`,
      };
    }
    return null;
  }

  // add/remove product except swatch
  const targetCart = isIncreased ? nextCart : preCart;
  const targetItem = targetCart?.line_items.find((lineItem) => String(lineItem.variant.id) === String(variant.id));
  const quantityDifference = nextCart.item_count - preCart.item_count;
  const product = getProductNeedTracking(targetItem, quantityDifference);
  if (isIncreased) {
    return {
      _event: 'addToCart',
      userStatus: user ? 'logged-in' : 'logged-out',
      userEmail: user?.emailHashed || '',
      userEmail2: user?.email || '',
      eventId,
      ecommerce: {
        currencyCode: __CURRENCY__,
        add: {
          products: [product],
        },
      },
      ...(atc_type && { atc_type }),
    };
  }
  return {
    _event: 'removeFromCart',
    ecommerce: {
      currencyCode: __CURRENCY__,
      remove: {
        products: [product],
      },
    },
  };
}

function checkout(action, preState, nextState) {
  const { cart } = nextState;
  const { data: order } = cart;
  // const { pathname } = getLastPageView(tracking.historyViews);
  const { checkoutStep, paymentMethod, eventId } = action.result;
  // eslint-disable-next-line prefer-const
  let { line_items: lineItems, selected_assembly_preferences: selectedAssemblyPreferences, shipments } = order;
  lineItems = lineItems.filter((lineItem) => !lineItem.is_swatch);
  if (lineItems.length <= 0) {
    return;
  }

  let checkoutObj = {
    actionField: {
      step: checkoutStep,
      option: null,
    },
  };
  // Step 1: when the user starts the checkout. The products array contains every item in cart.
  if (checkoutStep === 1) {
    const products = getProductsNeedTracking(lineItems);
    const originalValue = getOriginalAmount(order?.item_total || 0);

    checkoutObj = {
      ...checkoutObj,
      products,
      value: originalValue,
    };
    trackClickCheckout({
      order,
      currency,
      value: originalValue,
      eventId,
    });
  }
  // Step 4: when the user proceeds to payment. checkout_option should be shipment option
  else if (checkoutStep === 4) {
    if (__COUNTRY__ === 'SG') {
      checkoutObj.actionField.option = selectedAssemblyPreferences?.[0]?.slug || null;
    } else {
      checkoutObj.actionField.option = shipments?.[0]?.selected_service_type?.type || null;
    }
  }
  // Step 5: when the user completes the order(right before the Purchase event). checkout_option should be payment option
  else if (checkoutStep === 5) {
    checkoutObj.actionField.option = paymentMethod;
  }

  return {
    _event: 'checkout',
    eventId,
    ecommerce: {
      currencyCode: __CURRENCY__,
      checkout: checkoutObj,
    },
  };
}

// - when a user selects a payment method (Google pay, Apple pay, etc.), record their selections
// - this event is triggered by selection on the payment page, before the purchase event
function selectPaymentMethod(action, preState, nextState) {
  const { cart } = nextState;
  const { data: order } = cart;
  const { number, total } = order || {};
  const { paymentMethod } = action.result;

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'select_payment_method',
    'eventDetails.action': paymentMethod, // dynamic, payment method
    transactionId: number, // order ID
    transactionTotalsh: (+total).toFixed(2), // total order value incl tax and shipping
  };
}

function transaction(action, preState, nextState) {
  let trackedArr = [];
  const { auth, cart, scheduleDelivery } = nextState;
  const { user } = auth;
  const { data: order } = cart;

  const swatches = order.line_items.filter((lineItem) => lineItem.is_swatch);
  const products = order.line_items.filter((lineItem) => !lineItem.is_swatch);
  const trackedOrder = {
    ...order,
    line_items: products,
    item_count: order.item_count - swatches.length,
  };

  // Schedule Delivery
  if (order?.create_type === 'schedule_delivery') {
    const scheduleDeliveryInfo = scheduleDelivery.data || {};
    const {
      order_number: transactionId,
      ship_address: shipAddress,
      line_items: scheduleDeliveryItems,
      selected_slot: selectedSlot,
      client_identifier: orderType,
    } = scheduleDeliveryInfo;

    const purchaseData = scheduleDeliveryItems?.reduce(
      (acc, cur) => {
        const subtotal = cur?.variant?.product_price * cur?.quantity;
        const subtotalDiscounted = subtotal - cur?.line_discount || 0;

        acc.total += subtotalDiscounted;
        if (acc.total < 0) {
          acc.total = 0;
        } // order value excl. tax and shipping after discount (SUM of item_subtotal_discounted)
        acc.items.push({
          name: cur?.variant?.product_name,
          quantity: cur?.quantity,
          item_subtotal: subtotal?.toFixed(2), // purchase quantity * unit price
          item_subtotal_discounted: subtotalDiscounted?.toFixed(2), // purchase quantity * unit price - line_discount
        });
        return acc;
      },
      { total: 0, items: [] }
    );

    trackedArr.push({
      event: 'schedule_delivery', // static value
      pageCountry: __COUNTRY__, // US, AUS, SG - country selected
      userID: user ? user.id : '', // User ID value
      userEmail: user?.emailHashed || '',
      userEmail2: user?.email || '',
      transactionId, // order ID
      transactionZipcode: shipAddress?.zipcode, // shipping zipcode
      ecommerce: {
        order_total: purchaseData?.total?.toFixed(2),
        purchase: purchaseData?.items,
        orderType, // dynamic, value ='web' or 'pos', specifying order source
        deliveryTimeSlot: {
          date: selectedSlot?.date,
          display_name: selectedSlot?.display_name,
          start_time: selectedSlot?.start_time,
          end_time: selectedSlot?.end_time,
          price: selectedSlot?.price,
          is_premium: selectedSlot?.is_premium,
        },
        deliveryDate: selectedSlot && getDate(selectedSlot.start_time).format('D MMM YYYY'), // the scheduled delivery date on the confirmation page
      },
    });
    return trackedArr;
  }

  if (swatches && swatches.length) {
    trackedArr = swatches.map((swatch) => ({
      _event: 'trackEvent',
      'eventDetails.category': 'Ecommerce',
      'eventDetails.action': 'Swatch',
      'eventDetails.label': `${swatch.variant.sku} | ${swatch.variant.name}`,
    }));
  }
  if (!products || products.length <= 0) return trackedArr;

  const {
    number,
    reference_number: referenceNumber,
    total,
    shipment_total: shipmentTotal,
    tax_total: taxTotal,
    promo_total: promoTotal,
    coupon,
    promotions,
    line_items: lineItems,
    city,
    zipcode,
  } = trackedOrder;
  const discount = Math.abs(promoTotal);
  const transactionTotal = total - shipmentTotal;
  const approximateTax = __COUNTRY__ === 'US' ? (+taxTotal).toFixed(2) : getApproximateTax(total - taxTotal);
  const trackedProducts = getProductsNeedTracking(lineItems);

  const eventId = randomId('Purchase');
  // track ga checkout pageview
  trackPurchase({ user, order, eventId });
  trackedArr.push({
    _event: 'transaction',
    eventId,
    pageContent: 'checkout-confirm',
    pageProduct: 'other',
    pageCountry: __COUNTRY__,
    pageCat: 'checkout',
    pageType: 'checkout',
    userID: user ? user.id : '',
    userStatus: user ? 'logged-in' : 'logged-out',
    userType: user ? 'member' : 'guest',
    userEmail: user?.emailHashed || '',
    userPhone: user?.phoneHashed || '',
    userEmail2: user?.email || '',
    zipcode,

    currencyCode: __CURRENCY__, // currency code
    transactionId: number, // order number
    transactionId2: referenceNumber,
    transactionTotalsh: (+total).toFixed(2), // total order value incl tax and shipping
    transactionTotal: (transactionTotal < 0 ? 0 : transactionTotal).toFixed(2), // total order value excl shipping
    transactionTotalNet: (transactionTotal - approximateTax < 0 ? 0 : transactionTotal - approximateTax).toFixed(2), // total order value excl approximate taxes and shipping
    transactionTotalNetActualTax: (transactionTotal - taxTotal < 0 ? 0 : transactionTotal - taxTotal).toFixed(2), // total order value excl actual taxes and shipping
    transactionDiscount: discount.toFixed(2), // total discount value applied to order if applicable
    transactionCoupon: coupon ? coupon.code : '', //  order coupon code if applicable
    transactionPromo: promotions.length ? promotions[0].name : '', // order promo code if applicable
    transactionTax: approximateTax, // approximate tax value
    transactionActualTax: (+taxTotal).toFixed(2), // actual tax value
    transactionShipping: (+shipmentTotal).toFixed(2), // shipping costs if applicable
    transactionCountry: __COUNTRY__, // shipping country
    customerCity: city,
    ecommerce: {
      currencyCode: __CURRENCY__, // currency used on page
      purchase: {
        actionField: {
          id: number, // order number
          revenue: transactionTotal - approximateTax > 0 ? (transactionTotal - approximateTax).toFixed(2) : 0, // total order value excl approximate taxes and shipping
          shipping: (+shipmentTotal).toFixed(2), // order shipping costs
          tax: approximateTax, // approximate tax value
          coupon: coupon ? coupon.code : '', // promo or coupon code if used - if not leave empty
        },
        products: trackedProducts,
      },
    },
  });
  return trackedArr;
}

function signUp(action, preState, nextState) {
  const { user, method, tokens } = action.result;
  const eventId = randomId('Registration');
  trackSignUp(user, { eventId, accessToken: tokens?.access_token });
  return {
    _event: 'trackEvent',
    eventId,
    'eventDetails.category': 'Account',
    'eventDetails.action': 'User Registration',
    'eventDetails.label': user?.id,
    'eventDetails.method': method,
  };
}
function signIn(action, preState, nextState) {
  const { user, method } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Account',
    'eventDetails.action': 'User Sign In',
    'eventDetails.label': user?.id,
    'eventDetails.method': method,
  };
}

function formSubmit(action, preState, nextState) {
  const { action: detailAction, label, eventId, method } = action.result;
  return {
    _event: 'trackEvent',
    eventId,
    'eventDetails.category': 'Form',
    'eventDetails.action': detailAction || '',
    'eventDetails.label': label || '',
    'eventDetails.method': method || '',
  };
}

function videoProgress(action, preState, nextState) {
  const { sku, progress } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'video', // static
    'eventDetails.action': `${progress}% Completion`, // percentage of Completion , value is one of '25% Completion', '50% Completion', '75% Completion', '100% Completion'
    'eventDetails.label': sku, // sku of the variant
  };
}

// when a user see a product image on the product page
export function pdpImageImpression(action, preState, nextState) {
  const { assetPosition, assetType } = action.result;
  let skuId = '';
  let skuName = '';
  const targetVariant = getPDPCurrentVariant(nextState);
  if (targetVariant) {
    skuId = targetVariant.sku;
    skuName = targetVariant.name;
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_image',
    'eventDetails.action': assetPosition, // dynamic, image position (eg first image is 1, 2nd image is 2)
    'eventDetails.label': assetType, // dynamic, base, lifestyle,video, short-video
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
  };
}

// when user views a product image on product details page for >5s
export function pdpImageDuration(action, preState, nextState) {
  const { assetPosition, assetType } = action.result;
  let skuId = '';
  let skuName = '';
  const targetVariant = getPDPCurrentVariant(nextState);
  if (targetVariant) {
    skuId = targetVariant.sku;
    skuName = targetVariant.name;
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_image_5s',
    'eventDetails.action': assetPosition, // dynamic, image position (eg first image is 1, 2nd image is 2, dimension image is 'thumbnail button' or 'product dimension')
    'eventDetails.label': assetType, // dynamic, base, lifestyle, video, short-video, dimension
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
  };
}

// when a user clicks on specific sections in the product page
export function pdpDetails(action, preState, nextState) {
  const { detailAction, label, dyReportData } = action.result;
  let skuId = '';
  let skuName = '';
  const targetVariant = getPDPCurrentVariant(nextState);
  if (targetVariant) {
    skuId = targetVariant.sku;
    skuName = targetVariant.name;
  }
  if (dyReportData) {
    reportClickEngagement({
      decisionId: dyReportData.decisionId,
      variationId: dyReportData.variationId,
    });
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_details',
    'eventDetails.action': detailAction, // action: 'configuration', 'details', 'dimensions', 'delivery', 'review_dropdown', 'review_page'
    'eventDetails.label': label, // action: 'expand', 'close', <review dropdown option>, <review page number>
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
  };
}

export function pdpProductDetails(action, preState, nextState) {
  const { detailAction, label } = action.result;
  let spuId = '';
  let spuName = '';
  const targetVariant = getPDPCurrentMainVariant(nextState);
  if (targetVariant) {
    spuId = targetVariant.id;
    spuName = targetVariant.name;
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_details',
    'eventDetails.action': detailAction, // action: 'configuration', 'details', 'dimensions', 'delivery', 'review_dropdown', 'review_page'
    'eventDetails.label': label, // action: 'expand', 'close', <review dropdown option>, <review page number>
    'eventDetails.spu_id': spuId,
    'eventDetails.spu_name': spuName,
  };
}

// when a user clicks into a 3d model, record the length of time to finish loading the model
export function modelLoadTime(action, preState, nextState) {
  const { loadTime, modelId } = action.result;
  const targetVariant = getPDPCurrentVariant(nextState);

  return {
    _event: 'trackEvent',
    'eventDetails.category': '3d_model_loadtime', // static
    'eventDetails.action': loadTime, // <load time in seconds and mille seconds> dynamic, e.g. "1s3ms"
    'eventDetails.label': modelId, // <3d_model_id> // dynamic, the sketchfab 3d model id that customer clicks into
    'eventDetails.sku_name': targetVariant?.name || '',
    'eventDetails.sku_id': targetVariant?.sku || '',
  };
}

// when user clicks start button of the AR function
export function startAR(action, preState, nextState) {
  const { modelId } = action.result;
  const targetVariant = getPDPCurrentVariant(nextState);

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'start_ar_viewing', // static
    'eventDetails.action': 'click_ar_start', // static
    'eventDetails.label': modelId, // <3d_model_id> // dynamic, the sketchfab 3d model id that customer clicks into
    'eventDetails.sku_name': targetVariant?.name || '',
    'eventDetails.sku_id': targetVariant?.sku || '',
  };
}

export function pdpReviewSection(action, preState, nextState) {
  const { detailAction, label } = action.result;
  let skuId = '';
  let skuName = '';
  const targetVariant = getPDPCurrentVariant(nextState);
  if (targetVariant) {
    skuId = targetVariant.sku;
    skuName = targetVariant.name;
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_review_section', // static
    'eventDetails.action': detailAction, // dynamic, 'view_review_image', 'click_review_link', 'review_dropdown', 'select_review_page'
    'eventDetails.label': label, // dynamic, <review dropdown option> or <page number>
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
  };
}

export function pdpConfig(action, preState, nextState) {
  const { detailAction, label, skuId, skuName, spuId, spuName } = action.result;

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_config',
    'eventDetails.action': detailAction, // dynamic, based on section that the user selected. eg 'material', 'leg', 'length', 'model', 'size', 'cover'
    'eventDetails.label': label, // dynamic, name of option selected. eg 'Pearl Beige' if user selects 'Pearl Beige' material
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
    'eventDetails.spu_id': spuId,
    'eventDetails.spu_name': spuName,
  };
}

// when a user clicks on specific sections in the product page
function pdpRoomDesigner(action, preState, nextState) {
  const targetVariant = getPDPCurrentVariant(nextState);
  const skuId = targetVariant?.sku || '';
  const skuName = targetVariant?.name || '';

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'pdp_room_designer', // static
    'eventDetails.sku_name': skuName, // dynamic, SKU name for that page
    'eventDetails.sku_id': skuId, // dynamic, SKU ID for that page
  };
}

// when user visits a page and loads a DY api campaign
export function dyEvent(action, preState, nextState) {
  const { detailAction, label } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'dy_event',
    'eventDetails.action': detailAction,
    'eventDetails.label': label,
  };
}

export function mulberryWarrantyEvent(action) {
  const { detailAction, label, skuId, skuName, position, price } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'mulberry_warranty',
    'eventDetails.action': detailAction,
    'eventDetails.label': label,
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
    'eventDetails.position': position,
    'eventDetails.price': price,
  };
}

export function shopTheLookEvent(action) {
  const {
    detailAction,
    label = null,
    skuId = null,
    skuName = null,
    position = null,
    collection = null,
  } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'shop_the_look',
    'eventDetails.action': detailAction,
    'eventDetails.label': label,
    'eventDetails.sku_id': skuId,
    'eventDetails.sku_name': skuName,
    'eventDetails.position': position,
    'eventDetails.collection': collection,
  };
}

export function longLeadTime(action, preState, nextState) {
  const { detailAction, label } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'long_leadtime',
    'eventDetails.action': detailAction,
    'eventDetails.label': label,
  };
}

export function cartReco(action, preState, nextState) {
  const { detailAction, skuId, skuName } = action.result;

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'cart_event', // static
    'eventDetails.action': detailAction,
    'eventDetails.label': null,
    'eventDetails.sku_id': skuId, // dynamic, sku id of product added
    'eventDetails.sku_name': skuName, // dynamic, sku name of product added
  };
}

export function linkClick(action, preState, nextState) {
  const { category, action: detailAction, label, link } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': category,
    'eventDetails.action': detailAction,
    'eventDetails.label': label,
    'eventDetails.dimension5': link,
  };
}

function addCoupon(action, preState, nextState) {
  const { coupon } = action.result;
  const checkoutPathnames = [
    getUrl('checkout-shipping-address'),
    getUrl('checkout-shipping-method'),
    getUrl('checkout-payment'),
  ];
  const categories = ['checkout_shipping_address', 'checkout_shipping_method', 'checkout_payment'];
  const pathname = window.location.pathname.replace(__BASE_ROUTE__, '');
  const index = checkoutPathnames.findIndex((name) => name === pathname);
  const category = index === -1 ? 'cart_coupon' : categories[index];
  return {
    _event: 'trackEvent',
    'eventDetails.category': category,
    'eventDetails.action': 'add_coupon',
    'eventDetails.label': coupon,
  };
}

function searchAddress(action, preState, nextState) {
  const { searchedLocation } = action.result;
  const pathname = window.location.pathname.replace(__BASE_ROUTE__, '');
  if (pathname !== getUrl('checkout-shipping-address')) return;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_address',
    'eventDetails.action': searchedLocation ? 'search_address' : 'cant_find_address',
    'eventDetails.label': searchedLocation,
  };
}

function addAddress(action, preState, nextState) {
  const { addedLocation } = action.result;
  const pathname = window.location.pathname.replace(__BASE_ROUTE__, '');
  if (pathname !== getUrl('checkout-shipping-address')) return;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_address',
    'eventDetails.action': 'add_address',
    'eventDetails.label': addedLocation,
  };
}

function socialWidget(action, preState, nextState) {
  const { socialWidgetAction, post = { _uid: '' }, position = '' } = action.result;
  if (!socialWidgetAction) return;
  const pathname = window.location.pathname.replace(__BASE_ROUTE__, '');
  if (pathname.startsWith(getUrl('product'))) {
    // only track the event in PDP
    const targetVariant = getPDPCurrentVariant(nextState);
    if (targetVariant) {
      return {
        event: 'trackEvent',
        'eventDetails.category': 'social_widget',
        'eventDetails.action': socialWidgetAction,
        'eventDetails.label': post._uid,
        'eventDetails.sku_id': targetVariant.sku,
        'eventDetails.sku_name': targetVariant.name,
        'eventDetails.position': position,
      };
    }
  }
}

function shippingPreference(action) {
  const { label, position } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_method',
    'eventDetails.action': 'shipping_preference',
    'eventDetails.label': label,
    'eventDetails.position': position,
  };
}

function assemblyPreference(action) {
  const { label } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_method',
    'eventDetails.action': 'assembly_preference',
    'eventDetails.label': label,
  };
}

function shippingServiceType(action) {
  const { label, method, position } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_method',
    'eventDetails.action': 'service_type',
    'eventDetails.label': label,
    'eventDetails.method': method, // 'default' for default choice, 'select' for manual selection
    'eventDetails.position': position, // shipping id
  };
}

function contactFromFillup(action) {
  const { label, email, phone } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'contact_form_fillup',
    'eventDetails.action': email,
    'eventDetails.label': label,
    'eventDetails.method': phone,
  };
}

function initiateChat(action) {
  const { label, pageUrl } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'initiate_chat',
    'eventDetails.action': pageUrl,
    'eventDetails.label': label,
  };
}

/**
 * A function that tracks a link click event for showroom exclusives.
 *
 * @param {object} action - The action object containing result details.
 * @param {string} action.result.label - The label of the link clicked.
 * @param {'Banner' | 'CTA'| 'Card' | 'Footer'} action.result.position - The position of the link in the list.
 * @param {'Flagship Exclusives' | 'Ongoing Promotions' | null} action.result.method - The method used to access the link.
 */
function showroomExclusives(action) {
  const { label, position, method } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'showroom_exclusives',
    'eventDetails.action': 'link click',
    'eventDetails.label': label,
    'eventDetails.position': position,
    'eventDetails.method': method,
  };
}

/**
 * @description track the event when user click&summit the shipping zipcode
 * @param {object} action
 * @returns
 */
function cartShipping(params) {
  const { action, rewriteLabel } = params.result;
  const { type } = getCurrentContext() || {};
  let label = getCartShippingLabel(type);
  if (rewriteLabel && typeof rewriteLabel === 'function') {
    label = rewriteLabel(label);
  }
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'zipcode_shipping_calculator',
    'eventDetails.action': action,
    'eventDetails.label': label,
  };
}

// track when customer change the offline password set by our sales and login on our website
function resetPassword(action) {
  const { status } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'reset_password', // static
    'eventDetails.action': status, // dynamic, success/fail
  };
}

// DY A/B Test
function trackABTest(action) {
  const { campaignName, variation } = action.result;

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'dy_event_abtest',
    'eventDetails.action': campaignName,
    'eventDetails.label': variation,
  };
}

/**
 * @description track the event when user edit&save the shipping address
 */
function shippingAddressEdit(data) {
  const { action } = data.result;
  const actionsMap = {
    edit: 'Edit_Shipping_Address',
    save: 'Save_Edit_Shipping_Address',
  };
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_address',
    'eventDetails.action': actionsMap[action] || '',
  };
}
/**
 * https://app.clickup.com/t/865daj0z2
 * @description Triggered when the user clicks "Request For Preferred Delivery Period" on the shipping-method page
 */
function clickDeliveryPeriod() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_method',
    'eventDetails.action': 'delivery_option',
    'eventDetails.label': 'delivery_period_click',
  };
}

/**
 * @description When the user clicks the ‘i’ icon in the eco label, the tracking event is triggered.
 * https://app.clickup.com/t/865d9ac8q
 */
function clickEcoInfoIcon() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'checkout_shipping_method',
    'eventDetails.action': 'delivery_option',
    'eventDetails.label': 'eco_delivery_click',
  };
}

/**
 * @description Track the event when user click on the terms of use pop up
 * @param {object} action
 * @param {object} action.result
 * @param {string} action.result.action e.g. decline/accept
 */
function trackTOUPopup(action) {
  const { action: detailAction } = action.result;
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'TOU_pop_up',
    'eventDetails.action': detailAction,
  };
}

function trackPLAExperiment() {
  const variant = get('X-Exp-PlaLayout');
  console.log('trackPLAExperiment', variant);
  return {
    _event: 'experience_impression',
    exp_variant_string: `AWS-PLALAYOUT-${variant}`,
  };
}

function trackTrustpilotImpression() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'trustpilot',
    'eventDetails.action': 'impression',
    'eventDetails.label': 'review_widget',
  };
}

function trackTrustpilotClick() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'trustpilot',
    'eventDetails.action': 'click',
    'eventDetails.label': 'review_widget',
  };
}

function trackCasaEvent(action) {
  const { eventName, eventParams = {} } = action.result;
  return {
    ...eventParams,
    _event: eventName,
  };
}

export default {
  [EVENT_PAGE_VIEW]: pageView,
  [EVENT_IDENTIFY]: identify,
  [EVENT_PRODUCT_IMPRESSION]: productImpression,
  [EVENT_PRODUCT_CLICK]: productClick,
  [EVENT_PRODUCT_SORT]: productSort,
  [EVENT_PRODUCT_FILTER]: productFilter,
  [EVENT_PRODUCT_DETAIL]: productDetail,
  [EVENT_ADD_TO_WISHLIST]: addToWishList,
  [EVENT_CART_PROCESS]: cartProcess,
  [EVENT_CHECKOUT]: checkout,
  [EVENT_TRANSACTION]: transaction,
  [EVENT_SELECT_PAYMENT_METHOD]: selectPaymentMethod,

  [EVENT_SIGN_UP]: signUp,
  [EVENT_SIGN_IN]: signIn,
  [EVENT_FORM_SUBMIT]: formSubmit,
  [EVENT_VIDOE_PROGRESS]: videoProgress,

  [EVENT_PDP_IMAGE_IMPRESSION]: pdpImageImpression,
  [EVENT_PDP_IMAGE_DURATION]: pdpImageDuration,
  [EVENT_PDP_DETAILS]: pdpDetails,
  [EVENT_PDP_PRODUCT_DETAILS]: pdpProductDetails,
  [EVENT_PDP_REVIEW_SECTION]: pdpReviewSection,
  [EVENT_PDP_CONFIG]: pdpConfig,
  [EVENT_PDP_ROOM_DESIGNER]: pdpRoomDesigner,

  [EVENT_MODEL_LOAD_TIME]: modelLoadTime,
  [EVENT_START_AR]: startAR,

  [EVENT_DY_EVENT]: dyEvent,
  [EVENT_MULBERRY_WARRANTY]: mulberryWarrantyEvent,
  [EVENT_SHOP_THE_LOOK]: shopTheLookEvent,
  [EVENT_LONG_LEAD_TIME]: longLeadTime,

  [EVENT_LINK_CLICK]: linkClick,
  [EVENT_ADD_COUPON]: addCoupon,
  [EVENT_SEARCH_ADDRESS]: searchAddress,
  [EVENT_ADD_ADDRESS]: addAddress,
  [EVENT_SOCIAL_WIDGET]: socialWidget,
  [EVENT_CART_RECO]: cartReco,
  [EVENT_SHIPPING_PREFERENCE]: shippingPreference,
  [EVENT_ASSEMBLY_PREFERENCE]: assemblyPreference,
  [EVENT_SHIPPING_SERVICE_TYPE]: shippingServiceType,
  [EVENT_CONTACT_FORM_FILLUP]: contactFromFillup,
  [EVENT_INITIATE_CHAT]: initiateChat,
  [EVENT_SHOWROOM_EXCLUSIVES]: showroomExclusives,
  [EVENT_CART_SHIPPING]: cartShipping,
  [EVENT_RESET_PASSWORD]: resetPassword,
  [EVENT_DY_AB_TEST]: trackABTest,
  [EVENT_SHIPPING_ADDRESS_EDIT]: shippingAddressEdit,
  [EVENT_CLICK_ECO_INFO_ICON]: clickEcoInfoIcon,
  [EVENT_DELIVERY_PERIOD_CLICK]: clickDeliveryPeriod,
  [EVENT_TOU_POPUP]: trackTOUPopup,
  [EVENT_PLA_EXPERIMENT]: trackPLAExperiment,
  [EVENT_PRODUCT_PAGE_VIEW_MORE_THAN_3]: trackProductViewedMoreThanThreeTimes,
  [EVENT_TRUSTPILOT_IMPRESSION]: trackTrustpilotImpression,
  [EVENT_TRUSTPILOT_CLICK]: trackTrustpilotClick,
  [EVENT_CASA_TRACK_EVENT]: trackCasaEvent,
  ...cartEventsMap,
  ...storyblokEventsMap,
};
