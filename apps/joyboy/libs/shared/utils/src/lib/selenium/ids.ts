export const DATA_SELENIUM_PREFIX = 'data-selenium';

export const DATA_SELENIUM_ID_MAP = {
  // address
  ADDRESS_LIST_IS_SELECTED: 'address_list_is_selected',
  ADDRESS_LIST: 'address_list', // pass
  CHECKOUT_SHIPPING_ADDRESS: 'checkout-shipping-address', // pass
  // cart
  CART_ITEM_REMOVE: 'cart-item-remove', // pass
  CART_ITEM_MINUS: 'cart-item-minus', // pass
  CART_ITEM_PLUS: 'cart-item-plus', // pass
  FREE_GIFT_MODAL_BUTTON: 'free-gift-modal-button', //pass
  CLOSE_CART: 'close-cart', // mini cart close button // pass
  ADD_COUPON_CODE: 'add_coupon_code', // pass
  ADD_TO_CART: 'add_to_cart', // pass
  ADD_TO_CART_MOBILE: 'add_to_cart_mobile', // pass
  ADD_TO_CART_TABLET: 'add_to_cart_tablet', //pass
  CHECK_OUT: 'check-out', // pass
  // delivery
  CHECKOUT_SHIPPING_METHOD: 'checkout-shipping-method', // pass
  // payment
  PAYMENT_PAYPAL: 'payment-paypal',
  PAYMENT_AFFIRM: 'payment-affirm',
  PAYMENT_ZIP: 'payment-zip',
  PAYMENT_2C2P: 'payment-2c2p',
  PAYMENT_TERMS: 'payment-terms',
  PAYMENT_COMPLETE: 'payment-complete',
} as const;
