// set order_id in cookie for both users and guests to make sure the cart is synced in all tabs
import { trackCartOperation, trackCouponAdded } from 'utils/tracking';
import { get as getShippingLocation } from 'utils/shippingLocation';
import errorRedirect from 'containers/Checkout/utils/errorRedirect';
import { captureException } from 'utils/sentry.client.config';
import config, { defaultCity, isShippingServiceFeatureEnabled, enabledZipcodeFeature } from 'config';
import { randomId } from 'utils/number';
import * as Cookie from 'helpers/Cookie';
import { clearOrderCookies, replaceOrderCookies } from 'helpers/orderCookies';
import { isResourceInvalid, getErrorStatus } from 'helpers/httpStatus';
import { EVENT_ADD_COUPON, EVENT_CART_PROCESS } from 'utils/track/constants';
import { load as loadCouponsV1 } from 'redux/modules/coupons';
import { load as loadCouponsV2 } from 'redux/modules/couponsV2';
import { load as loadAddOnServices } from 'redux/modules/addOnServices';
import { httpErrorCodeMap } from 'utils/httpErrorCodeMap';
import { handleErrorZipcode } from './notice';
import {
  handleChangeShippingLocation,
  pleaseCallAfterUpdateValitedShippingLocation,
  selectedShippingLocation,
} from './geolocation';

const LOAD = 'cart/LOAD';
const LOAD_SUCCESS = 'cart/LOAD_SUCCESS';
const LOAD_FAIL = 'cart/LOAD_FAIL';
const CREATE = 'cart/CREATE';
const CREATE_SUCCESS = 'cart/CREATE_SUCCESS';
const CREATE_FAIL = 'cart/CREATE_FAIL';
const PROCESS = 'cart/PROCESS';
const PROCESS_SUCCESS = 'cart/PROCESS_SUCCESS';
const PROCESS_FAIL = 'cart/PROCESS_FAIL';

const LOAD_GIFTS = 'order/LOAD_GIFTS';
const LOAD_GIFTS_SUCCESS = 'order/LOAD_GIFTS_SUCCESS';
const LOAD_GIFTS_FAIL = 'order/LOAD_GIFTS_FAIL';

const loadCoupons = config.enableNewPromotion ? loadCouponsV2 : loadCouponsV1;

export const selectedShippingLocationFromCart = (globaleState) => {
  let res = {};
  if (globaleState.cart.data) {
    const { city, state, zipcode } = globaleState.cart.data;
    res = {
      city,
      state,
      zipcode,
    };
  }
  return res;
};

const initialState = {
  loading: false,
  loaded: false, // will be true whether success or failure
  creating: false, // creating a new order
  processing: false, // present adding, removing, changing quantity
};

export default function cart(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: pickLatest(state.data, action.result),
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: null,
      };
    case CREATE:
      return {
        ...state,
        creating: true,
      };
    case CREATE_SUCCESS:
      return {
        ...state,
        creating: false,
        data: pickLatest(state.data, action.result),
      };
    case CREATE_FAIL:
      return {
        ...state,
        creating: false,
      };
    case PROCESS:
      return {
        ...state,
        processing: true,
      };
    case PROCESS_SUCCESS:
      return {
        ...state,
        processing: false,
        data: pickLatest(state.data, action.result),
      };
    case PROCESS_FAIL:
      return {
        ...state,
        processing: false,
      };
    case LOAD_GIFTS:
      return {
        ...state,
        loadingGifts: true,
      };
    case LOAD_GIFTS_SUCCESS:
      return {
        ...state,
        loadingGifts: false,
        loadedGifts: true,
        giftPromotions: action.result,
      };
    case LOAD_GIFTS_FAIL:
      return {
        ...state,
        loadingGifts: false,
        loadedGifts: true,
      };
    default:
      return state;
  }
}

function pickLatest(prev, next) {
  // make sure data display is always the latest one
  if (prev && prev.updated_at) {
    if (next) {
      if (Date.parse(prev.updated_at) <= Date.parse(next.updated_at)) {
        return next;
      }
      if (prev.create_type === 'schedule_delivery') {
        return next;
      }
    }
    return prev;
  }
  return next;
}

function getOrderRequestOptions() {
  const accessToken = Cookie.get('access_token');
  const orderToken = Cookie.get('order_token');

  if (accessToken) {
    return { auth: 'strict' };
  }

  if (orderToken) {
    return {
      header: {
        'X-Spree-Order-Token': orderToken,
      },
    };
  }

  return {};
}

// helper function to determine options
function requestWrapper(
  callback,
  { refreshCart = true, redirectToCartOnError = false, refreshCoupon = true, refreshAddOnServices = false } = {}
) {
  return (dispatch, getState) => {
    const order = getState().cart.data;
    let orderNumber;
    let isServiceOrder = false;
    if (order && order.create_type === 'schedule_delivery') {
      orderNumber = Cookie.get('service_order_id');
      isServiceOrder = true;
    } else {
      orderNumber = Cookie.get('order_id');
    }
    const accessToken = Cookie.get('access_token');
    const orderToken = Cookie.get('order_token');

    if (orderNumber && (accessToken || orderToken)) {
      const options = {};

      if (accessToken) {
        options.auth = 'strict';
      } else {
        options.header = {
          'X-Spree-Order-Token': orderToken,
        };
      }

      const request = callback(orderNumber, options);

      request
        .then(() => {
          if (refreshCoupon) {
            dispatch(loadCoupons(orderNumber));
          }
        })
        .catch((error) => {
          const code = Array.isArray(error?.errors) ? error.errors[0].code : '';
          if (code === httpErrorCodeMap.get('CONFLICT')?.code) {
            return error;
          }
          if (refreshCart) {
            if (isServiceOrder) {
              dispatch(get(orderNumber));
            } else {
              dispatch(load()).then(() => {
                if (refreshAddOnServices) {
                  dispatch(loadAddOnServices());
                }
              });
            }
          }
          if (redirectToCartOnError) {
            errorRedirect(error);
          }
          captureException(error, {
            orderNumber,
            parameters: options,
          });
        });

      return request;
    }
    const result = Promise.reject('No order number is available. Please refresh the page and try again.');
    result.catch(() => {});
    return result;
  };
}

function needLoad(cart) {
  return !(cart && cart.loaded);
}

// replace the current order
export function replace(result) {
  return {
    type: LOAD_SUCCESS,
    result,
  };
}

// clear the current cart after successfully placing order
export function clear() {
  return {
    type: LOAD_FAIL,
  };
}

// change special_instructions, user, zipcode, or billing address
export function updateCart(data, refreshCart = true, redirectToCartOnError = false, refreshCoupon = true) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}`, options),
          });
        },
        {
          refreshCart,
          redirectToCartOnError,
          refreshCoupon,
        }
      )
    );
}

const initAndGetCartInfo = (skipMergeError) => (dispatch) => {
  const accessToken = Cookie.get('access_token');
  const orderToken = Cookie.get('order_token');
  const orderId = Cookie.get('order_id');

  if (accessToken) {
    // get user's order detail
    const loadPromise = dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get('/users/me/current_order', { auth: 'strict' }),
    });

    // merge order if orderId and orderToken exist in cookie
    if (orderToken && orderId) {
      return loadPromise.then(
        (result) => {
          // merge with existing order
          const orderNumber = result.number;
          const mergePromise = dispatch(merge(orderNumber, orderId, orderToken, skipMergeError));

          // set order id
          return mergePromise
            .then((res) => {
              replaceOrderCookies(res.number);
              return res;
            })
            .catch((error) => {
              // set order id to user's order id before merging if merging fails
              replaceOrderCookies(result.number);
              console.error("Merge order failed, but user's order is still available.");
              captureException(error, {
                orderNumber,
                parameters: {
                  orderToMerge: orderId,
                },
              });
              throw error;
            });
        },
        () => {
          // create a new order and merge
          const mergePromise = dispatch(create()).then((result) => {
            const orderNumber = result.number;
            return dispatch(merge(orderNumber, orderId, orderToken, skipMergeError));
          });

          // set order id
          return mergePromise
            .then((res) => {
              replaceOrderCookies(res.number);
              return res;
            })
            .catch((error) => {
              // 合并失败时，清除访客 token。
              // 'order_id' cookie 已指向新创建的购物车，这是正确的状态。
              Cookie.remove('order_token');
              throw error;
            });
        }
      );
    }
    return loadPromise
      .then((result) => {
        Cookie.set('order_id', result.number);
        return result;
      })
      .catch((err) => {
        // remove order id if loading user's order fails
        Cookie.remove('order_id');
        dispatch(create());
        throw err;
      });
  }
  if (orderToken && orderId) {
    const loadPromise = dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get(`/checkouts/${orderId}`, {
          header: {
            'X-Spree-Order-Token': orderToken,
          },
        }),
    });

    // Only clear cookies when the order is definitively invalid for this user.
    // Keeping cookies on transient failures (409 conflict, 429, 5xx, network)
    // lets the user recover their cart on the next request instead of silently
    // losing it. See docs/online-issues for the mobile 409 incident.
    return loadPromise.catch((err) => {
      if (isResourceInvalid(getErrorStatus(err))) {
        clearOrderCookies();
      }
      throw err;
    });
  }
  dispatch({
    type: LOAD_FAIL,
  });
  // const result = Promise.reject(new Error('No order available.'));
  // // const result = Promise.reject('No order available.');
  // result.catch(() => {});
  // return result;
};

// merge error
export function load(skipMergeError = false, loadCoupon = false) {
  return (dispatch, getState) => {
    const loadPromise = async () => {
      const cartInfo = await dispatch(initAndGetCartInfo(skipMergeError));
      const { zipcode } = cartInfo || {};
      const shippingLocation = selectedShippingLocation(getState());

      if (enabledZipcodeFeature) {
        if (zipcode && zipcode !== shippingLocation.zipcode) {
          try {
            await dispatch(updateCart(shippingLocation, false, false, false));
            dispatch(pleaseCallAfterUpdateValitedShippingLocation());
          } catch (error) {
            dispatch(handleErrorZipcode({ error, errorZipcode: shippingLocation.zipcode }));
          }
        }
      }
    };

    return loadPromise()
      .then(() => {
        const orderId = Cookie.get('order_id');
        if (orderId && loadCoupon) {
          dispatch(loadCoupons(orderId));
        }
      })
      .catch(() => {});
  };
}

// skipMergeError is used when load is followed by another operation to
// avoid warning message is swallown
export function loadIfNeeded(skipMergeError = false, loadCoupon = false) {
  return (dispatch, getState) => {
    if (needLoad(getState().cart)) {
      return dispatch(load(skipMergeError, loadCoupon));
    }
    return Promise.resolve(getState().cart.data).then(() => {
      const orderId = Cookie.get('order_id');
      if (orderId && loadCoupon) {
        dispatch(loadCoupons(orderId));
      }
    });
  };
}

function merge(orderNumber, orderId, orderToken, skipError) {
  return {
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: (client) =>
      client.put(`/checkouts/${orderNumber}/merge`, {
        auth: 'strict',
        data: {
          order_to_merge: orderId,
          order_token: orderToken,
          warning_message_delay: skipError,
        },
      }),
  };
}

function create() {
  return (dispatch, getState) => {
    // create only if not creating
    if (!getState().cart.creating) {
      // if user is logged in
      const accessToken = Cookie.get('access_token');
      if (accessToken) {
        const request = dispatch({
          types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
          promise: (client) => client.post('/checkouts', { auth: 'strict' }),
        });

        // register order id
        request.then((response) => {
          Cookie.set('order_id', response.number);
        });

        return request;
      }
      const request = dispatch({
        types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
        promise: (client) => client.post('/checkouts'),
      });

      // register order token and order id
      request.then((response) => {
        Cookie.set('order_id', response.number);
        Cookie.set('order_token', response.guest_token);
      });

      return request;
    }
    const result = Promise.reject('Another order is already creating.');
    result.catch(() => {});
    return result;
  };
}

// The real add to cart function
// this is only called when ((accessToken || orderToken) && orderId) is true
function addToCart({
  city,
  product = {},
  variant = {},
  quantity = 1,
  selectedVariants = {},
  listName,
  listPosition,
  isSwatch,
  swatchRelatedProduct,
  warrantyInfo,
  type,
  atc_type,
}) {
  return (dispatch, getState) => {
    const { cart } = getState();
    if (cart.loading || cart.creating || cart.processing || !cart.data) {
      const result = Promise.reject('Cart is not ready, please try again later.');
      result.catch(() => {});
      return result;
    }

    const cartCopy = JSON.parse(JSON.stringify(cart.data));
    // change cart zip if needed
    const _city = !enabledZipcodeFeature ? defaultCity : city || getShippingLocation();
    let changeZipRequest = Promise.resolve();
    if (
      cart.data.zipcode !== _city.zipcode ||
      cart.data.country_state !== _city.state ||
      cart.data.city !== _city.city
    ) {
      changeZipRequest = dispatch(
        updateCart(
          {
            zipcode: _city.zipcode,
            country_state: _city.state,
            city: _city.city,
          },
          true,
          false
        )
      );
    }

    return changeZipRequest
      .catch(() => {})
      .then(() =>
        dispatch(
          requestWrapper(
            (orderNumber, options) => {
              options.data = {};
              options.data.quantity = quantity;
              options.data.options = {
                list_name: listName,
                list_position: listPosition,
              };
              if (warrantyInfo?.isSelected) {
                options.data.options.warranty_offer_id = warrantyInfo.warranty_offer_id;
              }
              if (product.product_type === 'bundle') {
                options.data.variant_id = variant.id;
                options.data.options.bundle_options = Object.keys(selectedVariants).map((key) => ({
                  bundle_option_id: key,
                  bundle_option_variant_id: selectedVariants[key].id,
                }));
              } else if (variant.id !== undefined) {
                // for regular product
                options.data.variant_id = variant.id;
              } else {
                // for customization
                options.data.product_id = product.id;
                options.data.options.customizations = variant.variant_option_values.map((o) => ({
                  option_id: o.option_type_id,
                  value_id: o.option_value_id,
                }));
              }
              const addPromise = dispatch({
                types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
                promise: (client) => client.post(`/checkouts/${orderNumber}/line_items`, options),
              });

              const eventId = randomId('addToCart');

              // tracking
              addPromise.then((res) => {
                dispatch(loadCoupons(orderNumber));

                let variantObj = variant;
                if (type === 'hulla') {
                  const { variant: getVariantInfo } = res?.line_items?.find((v) => +v.variant.id === +variant.id) || {};
                  variantObj = getVariantInfo || {};
                }

                // determine the real price
                let price = +variantObj.price || 0;
                if (product.product_type === 'bundle') {
                  if (product.bundle_options) {
                    price = product.bundle_options.reduce(
                      (result, option) =>
                        result + +selectedVariants[option.id].price_modifier * option.default_quantity,
                      +variantObj.price
                    );
                  } else if (product.bundle_line_items) {
                    price = product.bundle_line_items.reduce(
                      // eslint-disable-next-line no-unsafe-optional-chaining
                      (result, option) => result + +option.price * option.bundle_option?.default_quantity,
                      +variantObj.price
                    );
                  }
                }
                console.log('🚀 ~ file: cart.js:578 ~ addToCart ~ variantObj:', res, variantObj, cartCopy);
                // add ga, fbp, pintrek add to cart tracking
                trackCartOperation({
                  variant: variantObj,
                  quantity,
                  isIncreased: true,
                  price,
                  listName,
                  listPosition,
                  isSwatch,
                  swatchRelatedProduct,
                  cart: getState().cart.data,
                  preCart: cartCopy,
                  eventId,
                });
                // for tracking
                dispatch({
                  type: EVENT_CART_PROCESS,
                  result: {
                    variant: variantObj,
                    isSwatch,
                    preCart: cartCopy,
                    isIncreased: true,
                    eventId,
                    atc_type,
                  },
                });
              });

              return addPromise;
            },
            {
              refreshCoupon: false,
              refreshCart: type !== 'hulla',
            }
          )
        )
      );
  };
}

export function add(options) {
  return (dispatch) => {
    if ((Cookie.get('access_token') || Cookie.get('order_token')) && Cookie.get('order_id')) {
      return dispatch(addToCart(options));
    }
    return dispatch(create()).then(() => {
      if ((Cookie.get('access_token') || Cookie.get('order_token')) && Cookie.get('order_id')) {
        return dispatch(addToCart(options));
      }
    });
  };
}

/*
 * cart modification functions
 */

// add or remove item from cart
export function process(item, increment) {
  return (dispatch, getState) =>
    dispatch(
      requestWrapper((orderNumber, options) => {
        const cartCopy = JSON.parse(JSON.stringify(getState().cart.data));
        let request;
        if (increment) {
          // modify quantity
          options.data = {
            quantity: item.quantity + increment,
            options:
              item.warranty_items !== null
                ? {
                    warranty_offer_id: item.warranty_items.warranty_offer_id,
                  }
                : {},
          };
          request = dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/line_items/${item.id}`, options),
          });
        } else {
          // delete item
          request = dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.del(`/checkouts/${orderNumber}/line_items/${item.id}`, options),
          });
        }
        request.then(() => {
          const isIncreased = increment && increment > 0;
          const eventId = randomId('addToCart');
          trackCartOperation({
            variant: item.variant,
            isSwatch: item.is_swatch,
            quantity: increment ? Math.abs(increment) : item.quantity,
            isIncreased,
            cart: getState().cart.data,
            preCart: cartCopy,
            eventId,
          });
          dispatch({
            type: EVENT_CART_PROCESS,
            result: {
              variant: item.variant,
              isSwatch: item.is_swatch,
              preCart: cartCopy,
              isIncreased,
              eventId,
            },
          });
        });

        return request;
      })
    );
}

export function refreshPrice() {
  return (dispatch) =>
    dispatch(
      requestWrapper((orderNumber, options) =>
        dispatch({
          types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
          promise: (client) => client.put(`/checkouts/${orderNumber}/price`, options),
        })
      )
    );
}

export function updateWarranty(item, warrantyOfferId) {
  return (dispatch) =>
    dispatch(
      requestWrapper((orderNumber, options) => {
        options.data = {
          quantity: item.quantity,
          options: warrantyOfferId !== null ? { warranty_offer_id: warrantyOfferId } : {},
        };
        return dispatch({
          types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
          promise: (client) => client.put(`/checkouts/${orderNumber}/line_items/${item.id}`, options),
        });
      })
    );
}

export function get(orderNum, orderToken) {
  return (dispatch) => {
    // orderToken is only used for third party checkout
    const options = !orderToken
      ? { auth: 'strict' }
      : {
          header: {
            'X-Spree-Order-Token': orderToken,
          },
        };
    return dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`/orders/${orderNum}`, options),
    });
  };
}

export function addCoupon(code) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = {
            coupon_code: code,
          };

          const request = dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.post(`/checkouts/${orderNumber}/coupon`, options),
          });

          request
            .then((result) => {
              const { coupon } = result;
              dispatch({
                type: EVENT_ADD_COUPON,
                result: { coupon: coupon.code },
              });
              trackCouponAdded(result);
            })
            .catch((err) => null);

          return request;
        },
        {
          refreshCoupon: false,
        }
      )
    );
}

export function removeCoupon() {
  return (dispatch, getState) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = {
            coupon_code: getState().cart.data && getState().cart.data.coupon.code,
          };

          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.del(`/checkouts/${orderNumber}/coupon`, options),
          });
        },
        {
          refreshCoupon: false,
        }
      )
    );
}

export function addGift(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/gift`, options),
          });
        },
        {
          refreshCoupon: false,
        }
      )
    );
}

export function addGiftV2(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/gift_v2`, options),
          });
        },
        {
          refreshCoupon: false,
        }
      )
    );
}

/*
 * checkout processes
 */

export function confirmRegistration(email) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          if (email) {
            options.data = {
              email,
            };
          }
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/registration`, options),
          });
        },
        {
          redirectToCartOnError: true,
        }
      )
    );
}

export function confirmAddress(address) {
  return async (dispatch) => {
    const res = await dispatch(
      requestWrapper((orderNumber, options) => {
        options.data = {
          ship_address_attributes: address,
        };
        return dispatch({
          types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
          promise: (client) => client.put(`/checkouts/${orderNumber}/address`, options),
        });
      })
    );
    const { city, zipcode, country_state: state } = res;
    dispatch(
      handleChangeShippingLocation({
        city,
        zipcode,
        state,
      })
    );
  };
}

export function confirmDelivery(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/delivery`, options),
          });
        },
        {
          redirectToCartOnError: true,
        }
      )
    );
}

export function changeDeliveryOption(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: async (client) => {
              const response = await client.put(`/checkouts/${orderNumber}/delivery_option`, options);
              if (isShippingServiceFeatureEnabled) {
                await dispatch(loadAddOnServices(orderNumber));
              }
              return response;
            },
          });
        },
        {
          redirectToCartOnError: true,
        }
      )
    );
}

export function changeShipmentServices(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/shipments_service_type`, options),
          });
        },
        {
          refreshAddOnServices: true,
        }
      )
    );
}

export function changeDeliveryServices(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper((orderNumber, options) => {
        options.data = data;
        return dispatch({
          types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
          promise: (client) => client.post(`/checkouts/${orderNumber}/shipment_service`, options),
        });
      })
    );
}

export function prePayCheck() {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) =>
          dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.post(`/checkouts/${orderNumber}/prepay_check`, options),
          }),
        {
          redirectToCartOnError: true,
          refreshCoupon: false,
        }
      )
    );
}

export function confirmPayment(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/payment`, options),
          });
        },
        {
          redirectToCartOnError: true,
          refreshCoupon: false,
        }
      )
    );
}

export function approveZip(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/zip_pay_approve`, options),
          });
        },
        {
          refreshCoupon: false,
        }
      )
    );
}

export function get2c2pEncryption(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_FAIL, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/tctp_confirm`, options),
          });
        },
        {
          redirectToCartOnError: true,
          refreshCoupon: false,
        }
      )
    );
}

export function approveStripe(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_FAIL, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/stripe_checkout`, options),
          });
        },
        {
          redirectToCartOnError: true,
          refreshCoupon: false,
        }
      )
    );
}

export function approveAffirm(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.post(`/checkouts/${orderNumber}/affirm_checkout`, options),
          });
        },
        {
          redirectToCartOnError: true,
          refreshCoupon: false,
        }
      )
    );
}

export function checkoutWithGrabPay(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.post(`/checkouts/${orderNumber}/grabpay_checkout`, options),
          });
        },
        { redirectToCartOnError: true, refreshCoupon: false }
      )
    );
}

export function approveGrabPay(data) {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          options.data = data;
          return dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/grabpay_approve`, options),
          });
        },
        { redirectToCartOnError: true, refreshCoupon: false }
      )
    );
}

export function complete() {
  return (dispatch) =>
    dispatch(
      requestWrapper(
        (orderNumber, options) => {
          const request = dispatch({
            types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
            promise: (client) => client.put(`/checkouts/${orderNumber}/complete`, options),
          });

          return request;
        },
        { refreshCoupon: false }
      )
    );
}

export const handleShippingLocationInCart =
  (shippingLocation, frame, successCallback) => async (dispatch, getState) => {
    try {
      // const shippingLocation = selectedShippingLocation(getState());
      await dispatch(updateCart(shippingLocation, false));
      dispatch(pleaseCallAfterUpdateValitedShippingLocation());
      frame.removeModal();
      successCallback && successCallback();
    } catch (error) {
      // console.log(`==============>error`);
      // console.log(error);
      frame.removeModal();
      dispatch(handleErrorZipcode({ error, errorZipcode: shippingLocation.zipcode }));
      try {
        await dispatch(updateCart(selectedShippingLocation(getState()), false));
      } catch (e) {
        // console.log(`==============>e`);
        // console.log(e);
        frame.removeModal();
        // Prevent the data obtained with selectedPrevCorrectShippingLocation from being wrong all the time
        dispatch(handleErrorZipcode({ error: e, errorZipcode: selectedShippingLocation(getState()).zipcode }, true));
      }
    }
  };

export function scheduleDelivery(data) {
  return (dispatch, getState) => {
    // create only if not creating
    if (!getState().cart.creating) {
      const request = dispatch({
        types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
        promise: (client) =>
          client.post('/schedule_delivery', {
            auth: 'strict',
            data,
          }),
      });

      return request;
    }
    const result = Promise.reject('Another order is already creating.');
    result.catch(() => {});
    return result;
  };
}

export function loadGifts({ orderNumber }) {
  return {
    types: [LOAD_GIFTS, LOAD_GIFTS_SUCCESS, LOAD_GIFTS_FAIL],
    promise: (client) => {
      const url = `/orders/${orderNumber}/promotions/gift`;
      return client.get(url, getOrderRequestOptions());
    },
  };
}

export function loadGiftsV2({ orderNumber, params = {} }) {
  return {
    types: [LOAD_GIFTS, LOAD_GIFTS_SUCCESS, LOAD_GIFTS_FAIL],
    promise: (client) => {
      const url = `v2/orders/${orderNumber}/promotions/gift`;
      return client
        .get(url, {
          ...getOrderRequestOptions(),
          params,
        })
        .then((response) => {
          // 筛选数据：排除所有 gift 中全部 variant 都没有库存的 promotion
          if (Array.isArray(response)) {
            return response.filter((promotion) => {
              // 检查 promotion 是否有 gifts

              if (promotion.control_type !== 1) {
                return true;
              }

              if (!promotion.gifts || !Array.isArray(promotion.gifts) || promotion.gifts.length === 0) {
                return false;
              }

              // 检查是否至少有一个 gift 有库存
              const hasAvailableGift = promotion.gifts.some(
                (gift) =>
                  // 检查 gift 的 state 是否为 OUT_OF_STOCK
                  gift.state !== 'OUT_OF_STOCK'
              );

              return hasAvailableGift;
            });
          }

          return response;
        });
    },
  };
}

/**
 * 推荐商品一键加购
 * @param {Object} data - 加购数据
 * @param {number} data.quantity - 商品数量
 * @param {number} data.variant_id - 变体ID
 * @returns {Promise} 返回加购结果
 */
export const recomendAddToCart = (data) => (dispatch) => {
  const { quantity, variant_id: variantId } = data;
  const orderNumber = Cookie.get('order_id');
  const accessToken = Cookie.get('access_token');
  const orderToken = Cookie.get('order_token');

  // 检查必要参数
  if (!orderNumber) {
    const error = new Error('No order number is available. Please refresh the page and try again.');
    console.error('recomendAddToCart error: No order number');
    return Promise.reject(error);
  }

  if (!accessToken && !orderToken) {
    const error = new Error('No authentication token is available. Please login and try again.');
    console.error('recomendAddToCart error: No token');
    return Promise.reject(error);
  }

  // 设置请求选项
  const options = {
    data: {
      quantity,
      variant_id: variantId,
    },
  };
  // 根据 token 类型设置认证方式
  if (accessToken) {
    options.auth = 'strict';
  } else {
    options.header = {
      'X-Spree-Order-Token': orderToken,
    };
  }

  // 发送请求
  return dispatch({
    types: [PROCESS, PROCESS_SUCCESS, PROCESS_FAIL],
    promise: (client) => client.post(`/checkouts/${orderNumber}/line_items`, options),
  })
    .then((result) => {
      dispatch(loadCoupons(orderNumber));
      return result;
    })
    .catch((error) => {
      dispatch(load());
      captureException(error, {
        orderNumber,
        parameters: options,
        context: 'recomendAddToCart',
      });
      throw error;
    });
};

export const recomendItemAddToCart = (data) => (dispatch) => {
  const orderNumber = Cookie.get('order_id');
  const accessToken = Cookie.get('access_token');
  const orderToken = Cookie.get('order_token');
  if (accessToken || (orderToken && orderNumber)) {
    return dispatch(recomendAddToCart(data));
  }
  return dispatch(create()).then(() => dispatch(recomendAddToCart(data)));
};
