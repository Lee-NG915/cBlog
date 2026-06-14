import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ApiClient from 'helpers/ApiClient';
import { connect } from 'react-redux';
import {
  confirmPayment,
  approveZip,
  complete,
  approveStripe,
  approveAffirm,
  prePayCheck,
  checkoutWithGrabPay,
  approveGrabPay,
} from 'redux/modules/cart';
import { getUrl } from 'pages';
// import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import AddressList from 'components/Address/AddressList';
import AddressDisplay from 'components/AddressDisplay';
import Address from 'components/Address';
import * as Cookie from 'helpers/Cookie';
import { Link } from 'react-router';
import { trackPayment } from 'utils/tracking';
import { getVariantLink } from 'utils/link';
import { loadAffirm } from 'utils/affirm';
import { isExpired } from 'utils/time';
import { loadIfNeeded as loadAddress, addAddress } from 'redux/modules/address';
import { EVENT_CHECKOUT, EVENT_TRANSACTION, EVENT_SELECT_PAYMENT_METHOD } from 'utils/track/constants';
import SvgIcon from 'components/SvgIcon';
import { GhostArrowBtn, ArrowBtn } from 'components/Button';
import { Elements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { load as loadDelivery } from 'redux/modules/scheduleDelivery';
import { Checkbox, Typography, Radio, Grid } from '@castlery/fortress';
import { httpErrorCodeMap } from 'utils/httpErrorCodeMap';
import { currency, enabledAfterPay } from 'config';
import PaymentMethod from './components/PaymentMethod';
import PayPalButtons from './components/PayPalButtons';

import style from './style.scss';
import { PAYMENT_METHOD, WALLETS_PAYMENT_METHOD } from './constant.js';

@connect(
  (state) => ({
    cart: state.cart,
    user: state.auth.user,
    instalment: state.instalment,
    address: state.address,
  }),
  {
    confirmPayment,
    approveZip,
    complete,
    approveStripe,
    approveAffirm,
    checkoutWithGrabPay,
    approveGrabPay,
    prePayCheck,
    loadAddress,
    addAddress,
    loadDelivery,
    trackOrderComplete: (result) => (dispatch) => dispatch({ type: EVENT_CHECKOUT, result }),
    trackScheduleDelivery: (result) => (dispatch) => dispatch({ type: EVENT_TRANSACTION, result }),
    trackSelectPaymentMethod: (result) => (dispatch) => dispatch({ type: EVENT_SELECT_PAYMENT_METHOD, result }),
  }
)
export default class Payment extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    instalment: PropTypes.object,
    address: PropTypes.object,
    confirmPayment: PropTypes.func.isRequired,
    approveZip: PropTypes.func.isRequired,
    complete: PropTypes.func.isRequired,
    approveStripe: PropTypes.func.isRequired,
    approveAffirm: PropTypes.func.isRequired,
    prePayCheck: PropTypes.func.isRequired,
    loadAddress: PropTypes.func.isRequired,
    addAddress: PropTypes.func.isRequired,
    loadDelivery: PropTypes.func,
    checkoutWithGrabPay: PropTypes.func.isRequired,
    trackOrderComplete: PropTypes.func,
    trackScheduleDelivery: PropTypes.func,
    trackSelectPaymentMethod: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  state = {
    initializing: true, // initializing braintree input fields or loading scripts
    processing: false, // processing request
    error: '', // error message
    paymentMethod: 'stripe', // one of 'stripe', 'paypal', 'zip', 'instalment', 'affirm'
    useShippingAddress: true,
    checked: false,
    selectedBank: null, // for instalment
    selectedBillAddress: this.props.cart.data.bill_address || this.props.cart.data.ship_address,
    stripeOptions: null, // for stripe
  };

  client = new ApiClient();

  stripe = null;

  _paypalPaymentMethodId = null;

  isScriptLoading = {}; // used for loading scripts

  stripeCardElement = React.createRef();

  instalmentRef = React.createRef();

  componentDidMount() {
    const { location } = this.context.router;
    const { user, loadAddress } = this.props;
    if (location.query.error) {
      const err =
        location.query.error === 'true'
          ? 'Something went wrong. Please try to continue with other payment methods, or contact us to complete your order.'
          : location.query.error;
      this.errMsg(err);
    }

    if (user) {
      loadAddress().catch(this.errMsg);
    }

    if (__STRIPE_ENABLED__) {
      this.setUpStripeClient()
        .then((stripeKey) => {
          if (stripeKey) {
            this.mountStripe(stripeKey);
          }
        })
        .catch(() => {
          this.setState({ initializing: false });
          this.errMsg();
        })
        .finally(() => {
          if (enabledAfterPay) {
            this.handleAfterpayResult();
          }
        });
    } else {
      this.setState({ initializing: false });
      if (enabledAfterPay) {
        this.handleAfterpayResult();
      }
    }
  }

  componentWillUnmount() {
    if (this.cardElement) {
      this.cardElement.unmount();
    }
  }

  handleAfterpayResult = async () => {
    const { cart } = this.props;
    const { location } = this.context.router;
    const { payment_intent_client_secret: paymentIntentClientSecret } = location.query || {};

    if (paymentIntentClientSecret) {
      // https://stripe.com/docs/js/payment_intents/retrieve_payment_intent
      const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(paymentIntentClientSecret);

      const currentURL = window.location.href;
      const newURL = currentURL.substring(0, currentURL.indexOf('?'));
      window.history.pushState({ path: newURL }, '', newURL);

      if (error) {
        return this.errMsg(error);
      }
      if (paymentIntent.status === 'succeeded') {
        try {
          await this.complete(cart.data);
        } catch (err) {
          const { router } = this.context;
          router.push(getUrl('cart'));
          this.errMsg(err);
        }
      } else {
        this.errMsg(paymentIntent?.last_payment_error?.message);
      }
    }
  };

  mountStripe = (publicKey) => {
    this.stripe = window.Stripe(publicKey);

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          textTransform: 'capitalize',
          '::placeholder': {
            color: '#A59198',
          },
          color: '#3C101E',
          fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          '@media (min-width: 0px) and (max-width: 600px)': {
            fontSize: '1rem',
          },
          '@media (min-width: 601px) and (max-width: 900px)': {
            fontSize: '1rem',
          },
          '@media (min-width: 901px)': {
            fontSize: '1.125rem',
          },
        },
        invalid: {
          color: '#65000B',
        },
        complete: {
          color: '#15C88F',
        },
      },
    });
    this.cardElement.mount(this.stripeCardElement.current);

    this.cardElement.on('ready', () => {
      this.setState({
        initializing: false,
      });
      this.cardElement.focus();
    });
    this.cardElement.addEventListener('change', (event) => {
      if (event.error) {
        this.setState({
          stripeError: event.error.message,
        });
      } else {
        this.setState({
          stripeError: '',
        });
      }
    });
  };

  setUpStripeClient = () =>
    this.client.get('/stripe_public_api_key').then(
      ({ public_api_key: publicKey }) =>
        new Promise((resolve) => {
          if (window.Stripe) {
            resolve(publicKey);
          } else {
            document.querySelector('#stripe-js').addEventListener('load', () => {
              resolve(publicKey);
            });
          }
        })
    );

  loadScript = (name, src) => {
    if (name !== 'Zip' && typeof window[name] !== 'undefined') {
      return Promise.resolve();
    }
    if (name === 'Zip' && window.Zip && window.Zip.Checkout) {
      return Promise.resolve();
    }
    if (name === 'affirm' && window.affirm) {
      return Promise.resolve();
    }
    if (this.isScriptLoading[name]) {
      return Promise.reject(new Error('script is already loading.'));
    }
    this.isScriptLoading[name] = true;
    this.setState({
      initializing: true,
    });

    const request = new Promise((resolve, reject) => {
      let s;
      if (name === 'affirm') {
        s = loadAffirm();
      } else {
        s = document.createElement('script');
        s.src = src;
        document.head.appendChild(s);
      }
      s.onload = () => {
        this.isScriptLoading[name] = false;
        this.setState({
          initializing: false,
        });
        resolve();
      };
      s.onerror = () => {
        this.isScriptLoading[name] = false;
        this.setState({
          initializing: false,
        });
        reject(new Error('Error in loading script.'));
      };
    });

    return request;
  };

  confirmPayment = (paymentAttributes) => {
    const { cart, confirmPayment } = this.props;
    const { useShippingAddress, selectedBillAddress } = this.state;

    const data = {};

    data.bill_address_attributes = useShippingAddress ? cart.data.ship_address : selectedBillAddress;

    if (paymentAttributes) {
      data.payments_attributes = paymentAttributes;
    }

    return confirmPayment(data);
  };

  registerPayment = (paymentAttributes) => {
    this.confirmPayment(paymentAttributes)
      .then((result) => {
        this.complete(result);
      })
      .catch((err) => {
        this.errMsg(err);
      });
  };

  registerStripe = (type) => {
    if (!this.stripe) {
      return;
    }

    this.setState({
      processing: true,
    });

    const { useShippingAddress, selectedBillAddress } = this.state;
    const { cart, approveStripe } = this.props;
    const billAddress = useShippingAddress ? cart.data.ship_address : selectedBillAddress;
    const { city, address1, address2, zipcode, firstname, lastname, phone, state_name } = billAddress;
    const billingDetails = {
      address: {
        city,
        country: __COUNTRY__,
        line1: address1,
        line2: address2,
        postal_code: zipcode,
        state: state_name,
      },
      email: cart.data.email,
      name: `${firstname} ${lastname}`,
      phone,
    };

    if (type === 'stripe') {
      // https://stripe.com/docs/js/payment_methods/create_payment_method#stripe_create_payment_method-paymentMethodData
      this.stripe
        .createPaymentMethod('card', this.cardElement, {
          billing_details: billingDetails,
        })
        .then(({ paymentMethod, error }) => {
          this.setState({
            processing: false,
          });

          if (error) {
            this.errMsg(error.message);
          } else {
            approveStripe({
              payment_method_id: paymentMethod.id,
            })
              .then(this.handleStripeServerResponse)
              .catch(this.errMsg);
          }
        })
        .catch(this.errMsg);
    } else {
      // https://stripe.com/docs/payments/afterpay-clearpay/accept-a-payment?platform=web&ui=API#web-submit-payment
      approveStripe({
        payment_method_type: 'afterpay_clearpay',
      })
        .then((res) => {
          if (res?.payment_intent_client_secret) {
            this.confirmAfterpay(res.payment_intent_client_secret, billingDetails);
          } else {
            this.errMsg();
            this.setState({
              processing: false,
            });
          }
        })
        .catch((err) => {
          this.errMsg(err);
          this.setState({
            processing: false,
          });
        });
    }
  };

  confirmAfterpay = async (paymentIntentClientSecret, billingDetails) => {
    // https://stripe.com/docs/js/payment_intents/confirm_afterpay_clearpay_payment
    const { error } = await this.stripe.confirmAfterpayClearpayPayment(paymentIntentClientSecret, {
      payment_method: {
        billing_details: billingDetails,
      },
      // will trigger a redirect when successful
      return_url: `${__BASE_URL__}${getUrl('checkout-payment')}`,
    });
    this.setState({
      processing: false,
    });

    if (error) {
      this.errMsg(error?.payment_intent?.last_payment_error?.message || error.message);
    }
  };

  registerZip = () => {
    this.loadScript('Zip', '//static.zipmoney.com.au/checkout/checkout-v1.min.js')
      .then(() => {
        const { cart, approveZip } = this.props;
        const order = cart.data;
        const { useShippingAddress, selectedBillAddress } = this.state;

        const accessToken = Cookie.get('access_token');
        const orderToken = Cookie.get('order_token');
        const checkoutToken = accessToken ? `access_token=${accessToken}` : `order_token=${orderToken}`;

        const data = {};
        if (useShippingAddress) {
          data.bill_address_attributes = order.ship_address;
        } else {
          data.bill_address_attributes = selectedBillAddress;
        }

        window.Zip.Checkout.init({
          checkoutUri: `${__APIHOST__}/checkouts/${order.number}/zip_pay_checkout?${checkoutToken}`,
          onComplete: (args) => {
            if (args.state === 'approved') {
              const zp_data = {
                checkout_id: args.checkoutId,
              };
              approveZip(zp_data)
                .then((result) => {
                  this.complete(result);
                })
                .catch((err) => this.errMsg(err));
            } else if (args.state === 'declined') {
              this.errMsg('Your order is declined by Zip, kindly contact Zip directly.');
            } else {
              this.errMsg('You have cancelled Zip transaction. Let us know if you have faced any issues.');
            }
          },
          onError: (args) => {
            if (args && args.detail && args.detail.response) {
              const error = JSON.parse(args.detail.response);
              this.errMsg(error);
            } else {
              this.errMsg(args && args.message);
            }
          },
        });
      })
      .catch((error) => this.errMsg(error));
  };

  registerInstalment = () => {
    this.instalmentRef?.current?.submit();
  };

  getAffirmAddress = (address, email) => ({
    name: {
      first: address.firstname,
      last: address.lastname,
    },
    address: {
      line1: address.address1,
      line2: address.address2,
      city: address.city,
      state: address.state_name,
      zipcode: address.zipcode,
      country: address.country,
    },
    phone_number: address.phone_number,
    email,
  });

  registerAffirm = () => {
    if (!window.affirm) {
      return;
    }
    const { cart, approveAffirm, trackOrderComplete } = this.props;
    const { useShippingAddress, selectedBillAddress, paymentMethod } = this.state;
    const order = cart.data;
    const billAddress = useShippingAddress ? order.ship_address : selectedBillAddress;
    const shippingAddress = order.ship_address;

    this.setState({
      processing: true,
    });
    const shippingAmount = Math.floor((order.shipment_total * 100).toFixed(2));
    const taxAmount = Math.floor((order.tax_total * 100).toFixed(2));
    const total = Math.floor((order.total * 100).toFixed(2));
    window.affirm.checkout({
      merchant: {
        public_api_key: __AFFIRM_PUBLIC_KEY__,
        user_confirmation_url: `${__BASE_URL__}${getUrl('checkout-success')}`,
        user_cancel_url: `${__BASE_URL__}${getUrl('checkout-payment')}`,
      },
      shipping: this.getAffirmAddress(shippingAddress, order.email),
      billing: this.getAffirmAddress(billAddress, order.email),
      items: [...order.line_items, ...order.addon_service_line_items].map((item) => ({
        display_name: item.variant.name,
        sku: item.variant.sku,
        unit_price: Math.floor((item.price * 100).toFixed(2)),
        qty: item.quantity,
        item_image_url: item.variant.images[0] && item.variant.images[0].links.medium,
        item_url: getVariantLink(item.variant),
        // TODO: add categories:
      })),
      discounts: {
        PROMO: {
          discount_amount: Math.abs(order.promo_total) * 100,
        },
      },
      metadata: {
        mode: 'modal',
      },
      order_id: order.number,
      shipping_amount: shippingAmount,
      tax_amount: taxAmount,
      total,
    });

    window.affirm.checkout.open({
      onFail: ({ reason }) => {
        this.setState({
          processing: false,
        });
        if (reason === 'canceled') {
          this.errMsg('You have cancelled Affirm transaction. Let us know if you have faced any issues.');
        } else {
          this.errMsg(reason);
        }
      },
      onSuccess: ({ checkout_token }) => {
        approveAffirm({ checkout_token })
          .then((result) => {
            trackPayment(result, paymentMethod);

            trackOrderComplete({
              checkoutStep: 5,
              paymentMethod,
            });

            this.handleCheckoutSuccess();
          })
          .catch(this.handleCheckoutError);
      },
    });
  };

  registerGrabPay = () => {
    const { checkoutWithGrabPay } = this.props;
    this.setState({
      processing: true,
    });
    checkoutWithGrabPay({
      redirect_uri: `${__BASE_URL__}${getUrl('checkout-grabpay')}`,
    })
      .then(({ payment_url }) => {
        window.location = payment_url;
        this.setState({ processing: false });
      })
      .catch((e) => {
        this.setState({ processing: false });
        this.errMsg(e);
      });
  };

  trackPayment(result) {
    const { paymentMethod } = this.state;
    const { trackOrderComplete } = this.props;
    // TODO 区分 苹果 和 谷歌支付
    trackPayment(result, paymentMethod);

    trackOrderComplete({
      checkoutStep: 5,
      paymentMethod,
    });
  }

  getStripeErrorProperty = (error, property) =>
    error?.[property] ||
    error?.payment_intent?.last_payment_error?.[property] ||
    error?.last_payment_error?.[property] ||
    error?.error?.[property];

  getStripeErrorCode = (error) => this.getStripeErrorProperty(error, 'code');

  getStripeErrorMessage = (error) => this.getStripeErrorProperty(error, 'message');

  getStripeDisplayMessage = (error) => {
    const errorCode = this.getStripeErrorCode(error);
    if (errorCode === 'payment_intent_authentication_failure') {
      return '3D Secure authentication failed. Please try again. If the popup does not appear, disable any browser extensions or use incognito mode.';
    }
    return this.getStripeErrorMessage(error) || (typeof error === 'string' ? error : undefined);
  };

  handleStripeServerResponse = async ({ status, payment_intent_client_secret }) => {
    const { approveStripe, cart } = this.props;

    if (status === 'succeeded') {
      this.complete(cart.data);
    }

    if (status === 'requires_action') {
      this.setState({
        processing: true,
      });
      const { error: errorAction, paymentIntent } = await this.stripe.handleCardAction(payment_intent_client_secret);
      this.setState({
        processing: false,
      });

      if (errorAction) {
        this.errMsg(this.getStripeDisplayMessage(errorAction));
      } else {
        const serverResponse = await approveStripe({
          payment_intent_id: paymentIntent.id,
        });

        this.handleStripeServerResponse(serverResponse);
      }
    }
  };

  handleTrackPixleeAfterCheckoutSuccess = (order) => {
    if (typeof pixlee_analytics !== 'undefined') {
      const { line_items, total, item_count, reference_number } = order;
      const cartContents = line_items.map((item) => ({
        price: item.variant.price,
        product_sku: item.variant.sku,
        quantity: item.quantity,
      }));
      pixlee_analytics.events.trigger('converted:photo', {
        cart_contents: cartContents,
        order_id: reference_number,
        cart_total_quantity: item_count,
        cart_total: total,
        currency,
      });
    }
  };

  handleCheckoutSuccess = () => {
    const { cart, loadDelivery, trackScheduleDelivery } = this.props;
    const { router } = this.context;
    const { data: order } = cart;
    this.handleTrackPixleeAfterCheckoutSuccess(order);
    const fulfillmentOrderId = cart.data.fulfillment_order_id;
    this.setState({
      processing: false,
    });
    if (fulfillmentOrderId) {
      loadDelivery(fulfillmentOrderId)
        .then(() => {
          trackScheduleDelivery();
        })
        .finally(() => {
          router.push({
            pathname: getUrl('schedule-delivery'),
            query: {
              fulfillment_order_id: fulfillmentOrderId,
            },
          });
        });
    } else {
      router.push(getUrl('checkout-success'));
    }
  };

  handleCheckoutError = (error) => {
    this.setState({
      processing: false,
    });

    this.errMsg(error);
  };

  handleCheckoutLockOrderError = (error) => {
    this.setState({
      processing: false,
    });
    const { frame } = this.context;
    frame.openModal('response', {
      body: error,
      button: {
        text: 'Got it',
        link: getUrl('cart'),
      },
    });
  };

  complete = (order) => {
    const { complete } = this.props;
    this.trackPayment(order);
    // 409时轮询30s
    let count = 15;
    let timer;
    const apiFn = (fn) => {
      count--;
      timer && clearTimeout(timer);
      complete()
        .then(this.handleCheckoutSuccess)
        .catch((error) => {
          const { code, detail } = Array.isArray(error?.errors) ? error.errors[0] : {};
          if (code === httpErrorCodeMap.get('CONFLICT')?.code) {
            if (count >= 1) {
              this.setState({ processing: true });
              timer = setTimeout(() => fn(fn), 2000);
            } else {
              this.handleCheckoutLockOrderError(detail);
            }
          } else {
            this.handleCheckoutError(error);
          }
        });
    };
    apiFn(apiFn);
  };

  // click continue button
  continue = () => {
    const { frame, router } = this.context;
    const { paymentMethod, checked } = this.state;
    const {
      cart: { data: order },
      prePayCheck,
    } = this.props;

    if (!checked) {
      frame.openModal('response', {
        status: 'failed',
        title: 'Oops!',
        body: 'Please accept terms and conditions before placing order.',
      });

      return;
    }

    if (order.reservation_expired_at && isExpired(order.reservation_expired_at)) {
      router.push({
        pathname: getUrl('cart'),
        state: {
          isExpired: true,
        },
      });
      return;
    }

    if (paymentMethod === 'stripe') {
      const { stripeError } = this.state;
      if (stripeError) {
        this.cardElement.focus();
        return;
      }
    }
    prePayCheck()
      .then(() => this.confirmPayment())
      .then(() => {
        if (+order.total === 0) {
          return this.complete(order);
        }
        if (paymentMethod === 'stripe' || paymentMethod === PAYMENT_METHOD.afterPay) {
          this.registerStripe(paymentMethod);
        } else if (paymentMethod === 'zip') {
          this.registerZip();
        } else if (paymentMethod === 'instalment') {
          this.registerInstalment();
        } else if (paymentMethod === 'affirm') {
          this.registerAffirm();
        } else if (paymentMethod === 'grabpay') {
          this.registerGrabPay();
        }
      });
  };

  errMsg = (error) => {
    const { frame } = this.context;
    frame.openModal('response', { body: error });
  };

  changePaymentMethod = (paymentMethod, isDefault) => {
    const { router } = this.context;
    const {
      cart: { data: order },
      trackSelectPaymentMethod,
    } = this.props;

    if (!isDefault) {
      trackSelectPaymentMethod({
        paymentMethod,
      });
    }

    if (paymentMethod === 'paypal') {
      if (order.reservation_expired_at && isExpired(order.reservation_expired_at)) {
        router.push({
          pathname: getUrl('cart'),
          state: {
            isExpired: true,
          },
        });
        return;
      }
      // SDK loading and button init are handled by PayPalButtons component
      this.setState({ paymentMethod });
    } else if (paymentMethod === 'affirm') {
      this.setState({
        paymentMethod,
      });
      this.loadScript('affirm').then(() => {
        window.affirm.ui.refresh();
        window.affirm.ui.error.on('close', () => {
          this.setState({
            processing: false,
          });
        });
      });
    } else if (WALLETS_PAYMENT_METHOD.includes(paymentMethod)) {
      if (order.reservation_expired_at && isExpired(order.reservation_expired_at)) {
        router.push({
          pathname: getUrl('cart'),
          state: {
            isExpired: true,
          },
        });
        return;
      }

      const { prePayCheck } = this.props;

      prePayCheck()
        .then(() => {
          this.setState({
            initializing: true,
            paymentMethod,
          });
        })
        .catch((e) => {
          this.errMsg(e);
        });
    } else {
      this.setState({
        paymentMethod,
      });
    }
  };

  paymentRequestOnReady = (stripeOptions) => {
    this.setState({
      stripeOptions,
    });
  };

  toggleAddress = (status) => {
    this.setState((state) => ({
      ...state,
      useShippingAddress: status,
    }));
  };

  handleSelectAddress = (address) => {
    this.setState({
      selectedBillAddress: address,
    });

    // prevent firing error
    return Promise.resolve();
  };

  handleAddAddress = (address) =>
    this.props.addAddress(address).then((addresses) => {
      this.setState({
        selectedBillAddress: addresses[addresses.length - 1],
      });
      return addresses;
    });

  submitAddress = (address) => {
    this.setState(
      {
        selectedBillAddress: address,
      },
      () => {
        this.continue();
      }
    );
    // prevent firing error
    return Promise.resolve();
  };

  toggleCheck = (status) => {
    this.setState((state) => ({
      ...state,
      checked: status,
    }));
  };

  // for instalment
  updateSelectedBank = (bank) => {
    this.setState({
      selectedBank: bank,
    });
  };

  /**
   * will be call when user complete payment
   */
  onPaymentMethod = async (ev) => {
    const {
      complete: browserComplete,
      // eslint-disable-next-line camelcase
      paymentMethod: { id: payment_method_id },
    } = ev;
    // console.log(`==============>ev`);
    // console.log(ev);
    const { cart, approveStripe, prePayCheck } = this.props;

    try {
      await prePayCheck(); // api-post-prepay_check
      await this.confirmPayment(); // api-payment
    } catch (error) {
      browserComplete('fail');
      this.errMsg(error);

      const { router } = this.context;
      router.push(getUrl('cart'));
      return;
    }

    const handleStripeServerResponse = async ({
      status,
      // eslint-disable-next-line camelcase
      payment_intent_client_secret,
    }) => {
      if (status === 'succeeded') {
        // Report to the browser that the confirmation was successful, prompting
        // it to close the browser payment method collection interface.
        await this.complete(cart.data); // api-complete
        browserComplete('success');
      } else if (status === 'requires_action') {
        this.setState({
          processing: true,
        });
        // Confirm the PaymentIntent without handling potential next actions (yet).
        const { paymentIntent, error: confirmError } = await this.stripe.confirmCardPayment(
          payment_intent_client_secret,
          { payment_method: payment_method_id },
          { handleActions: false }
        );
        this.setState({
          processing: false,
        });

        if (confirmError) {
          // Report to the browser that the payment failed, prompting it to
          // re-show the payment interface, or show an error message and close
          // the payment interface.
          browserComplete('fail');
          this.errMsg(confirmError);
        } else {
          const serverResponse = await approveStripe({
            payment_intent_id: paymentIntent.id,
          });
          handleStripeServerResponse(serverResponse);
        }
      } else {
        browserComplete('fail');
      }
    };

    // api-stripe_checkout
    approveStripe({
      payment_method_id,
    })
      .then(handleStripeServerResponse)
      .catch((error) => {
        browserComplete('fail');
        const { router } = this.context;
        router.push(getUrl('cart'));
        // FIXME: error message is not correctly
        // when Repeat orders
        // "This value must be greater than or equal to 1."
        this.errMsg(error);
      });
  };

  handleClickWalletBtn = (event) => {
    const { frame } = this.context;
    const { checked } = this.state;

    if (!checked) {
      frame.openModal('response', {
        status: 'failed',
        title: 'Oops!',
        body: 'Please accept terms and conditions before placing order.',
      });
      return event.preventDefault();
    }
  };

  handlePayPalCreateOrder = () => {
    const { checked } = this.state;
    if (!checked) {
      return Promise.reject(new Error("User haven't accept terms"));
    }
    const {
      prePayCheck,
      cart: { data: order },
    } = this.props;
    this.setState({ processing: true });
    const accessToken = Cookie.get('access_token');
    const orderToken = Cookie.get('order_token');
    const options = { data: { checkout_id: order.number } };
    if (accessToken) {
      options.auth = 'strict';
    } else {
      options.header = { 'X-Spree-Order-Token': orderToken };
    }
    return prePayCheck()
      .then(() => this.client.post('/paypal_orders', options))
      .then(({ paypal_order_id, payment_method_id }) => {
        this._paypalPaymentMethodId = payment_method_id;
        return paypal_order_id;
      });
  };

  handlePayPalApprove = ({ orderID, payerID }) =>
    this.confirmPayment({
      payment_method_id: this._paypalPaymentMethodId,
      source_attributes: {
        paypal_order_id: orderID,
        payer_id: payerID,
      },
    })
      .then((result) => this.complete(result))
      .catch((e) => this.errMsg(e))
      .finally(() => this.setState({ processing: false }));

  handlePayPalCancel = () => {
    this.setState({ processing: false });
    this.errMsg('You have cancelled Paypal transaction. Let us know if you have faced any issues.');
  };

  renderSubmitButton({ paymentMethod, order, initializing, isProcessing, stripeOptions, checked }) {
    const { frame } = this.context;
    switch (paymentMethod) {
      case 'paypal':
        return (
          <PayPalButtons
            order={order}
            checked={checked}
            onLoading={(loading) => this.setState({ initializing: loading })}
            onError={this.errMsg}
            openModal={(opts) => frame.openModal('response', opts)}
            createOrder={this.handlePayPalCreateOrder}
            onApprove={this.handlePayPalApprove}
            onCancel={this.handlePayPalCancel}
          />
        );
      case PAYMENT_METHOD.applePay:
      case PAYMENT_METHOD.googlePay:
      case PAYMENT_METHOD.link:
        return (
          <PaymentRequestButtonElement
            className={`${style.shipping}__next is-payment`}
            options={stripeOptions}
            onReady={() => {
              this.setState({
                initializing: false,
              });
            }}
            onClick={this.handleClickWalletBtn}
            onBlur={() => {}}
            onFocus={() => {}}
          />
        );
      default:
        return (
          <div className={`${style.shipping}__next is-payment`}>
            <ArrowBtn
              text="Place Your Order"
              size="medium"
              type="button"
              data-selenium="payment-complete"
              disabled={initializing || isProcessing}
              onClick={this.continue}
              className={`${style.shipping}__button`}
            />
          </div>
        );
    }
  }

  render() {
    const {
      initializing,
      processing: _processing,
      paymentMethod,
      useShippingAddress,
      checked,
      selectedBank,
      stripeError,
      selectedBillAddress,
      stripeOptions,
    } = this.state;
    const { user, cart, instalment, address } = this.props;
    const order = cart.data;
    const { router } = this.context;
    // const hasAsIsItems = order.line_items.some(item => item.variant.product_taxons.some(t => t.permalink === 'as-is'));
    const isServiceOrder = router.location.query.serviceOrder;
    const isFreeOrder = +order.total === 0;

    const isProcessing = _processing || cart.processing;

    return (
      <div className={style.payment}>
        <Elements stripe={this.stripe}>
          <Typography level="subh2" sx={{ mb: 1 }}>
            Shipping address
          </Typography>

          <div className={`${style.payment}__shipping`}>
            <div>
              <AddressDisplay
                // title="Shipping Address"
                address={order.ship_address}
                className={`${style.payment}__shippingAddress__content`}
              />
            </div>

            {order.special_instructions && (
              <div>
                <label>Delivery requests</label>
                <p>{order.special_instructions}</p>
              </div>
            )}
          </div>

          {!isFreeOrder && (
            <>
              <div className={`${style.payment}__title`}>
                <div className={`${style.title}__secondary`}>Payment method</div>
                <div className={`${style.payment}__title__secure`}>
                  <SvgIcon name="secure-encrypted" />
                  <span>Secure &amp; Encrypted</span>
                </div>
              </div>

              <PaymentMethod
                paymentRequestOnReady={this.paymentRequestOnReady}
                changePaymentMethod={this.changePaymentMethod}
                paymentMethod={paymentMethod}
                onPaymentMethod={this.onPaymentMethod}
                stripeError={stripeError}
                stripeCardElement={this.stripeCardElement}
                updateSelectedBank={this.updateSelectedBank}
                instalmentRef={this.instalmentRef}
              />
            </>
          )}

          <div
            className={classNames(`${style.payment}__address`, {
              'is-manual': !useShippingAddress && !user,
            })}
          >
            <Typography
              level="h3"
              sx={{
                mt: 3,
                mb: 2,
              }}
            >
              Billing address
            </Typography>
            <Checkbox
              data-selenium="payment-billing"
              checked={useShippingAddress}
              onChange={(e) => this.toggleAddress(e?.target?.checked)}
              label={
                <Typography level="body2" sx={{ color: '#3C101E' }}>
                  Use my shipping address
                </Typography>
              }
              sx={{
                '.MuiCheckbox-checkbox': {
                  border: '2px solid #844025',
                  '&.Mui-checked': {
                    backgroundColor: 'transparent',
                    border: '2px solid #844025',
                  },
                },

                '.MuiSvgIcon-root': {
                  color: '#844025',
                },
              }}
            />

            {user ? (
              <AddressList
                className={classNames(`${style.payment}__address__input`, {
                  'is-hidden': useShippingAddress,
                })}
                addresses={address.data}
                selectedAddress={selectedBillAddress}
                onAddAddress={this.handleAddAddress}
                onSelectAddress={this.handleSelectAddress}
              />
            ) : (
              <Address
                className={classNames(`${style.payment}__address__input`, {
                  'is-hidden': useShippingAddress,
                })}
                buttonLayout="float"
                cancelButton={{
                  text: 'Back',
                  onClick: () => router.push(getUrl('checkout-shipping-method')),
                  className: `${style.payment}__address__back`,
                }}
                submitButton={{
                  text: 'Place Your Order',
                  onClick: this.submitAddress,
                  className: `${style.payment}__address__next`,
                }}
                address={order.bill_address}
              />
            )}

            <div className={`${style.payment}__address__tnc`}>
              <Typography
                level="h3"
                sx={{
                  mt: 3,
                  mb: 2,
                  color: '#3C101E',
                }}
              >
                Terms & conditions
              </Typography>
              <Grid container spacing={1} wrap="nowrap" alignItems="flex-start">
                <Grid>
                  <Radio
                    data-selenium="payment-terms"
                    checked={checked}
                    onChange={(e) => this.toggleCheck(e?.target?.checked)}
                    sx={{
                      '&.Mui-checked': {
                        borderColor: '#844025',
                      },
                      '--fortress-palette-neutral-outlinedBorder': '#844025',
                      '.MuiRadio-radio': {
                        borderColor: '#844025',
                        '&:hover': {
                          borderColor: '#844025',
                        },
                      },
                      '--Icon-color': '#844025',
                      '.MuiRadio-icon': {
                        color: '#844025',
                        backgroundColor: '#844025',
                      },
                    }}
                  />
                </Grid>
                <Grid xs>
                  <Typography
                    level="body2"
                    sx={(theme) => ({
                      color: '#3C101E',
                      '& a': {
                        color: '#D25C1B',
                        // 下划线
                        textDecoration: 'underline',
                        '&:hover': {
                          color: '#D25C1B',
                          textDecoration: 'underline',
                        },
                      },
                    })}
                  >
                    <span>
                      By clicking the {paymentMethod !== 'paypal' ? 'Place Your Order' : 'PayPal'} button, I accept
                      Castlery's{' '}
                    </span>
                    <Link href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`} target="_blank">
                      refund
                    </Link>
                    {` and `}
                    <Link href={`${__BASE_URL__}${getUrl('delivery')}`} target="_blank">
                      delivery
                    </Link>{' '}
                    policy
                    {paymentMethod === 'instalment' && selectedBank && (
                      <span>
                        {` and `}
                        <a href={selectedBank.terms_url} target="_blank" rel="noopener noreferrer">
                          terms and conditions
                        </a>{' '}
                        of {selectedBank.bank}
                      </span>
                    )}
                    .
                  </Typography>
                </Grid>
              </Grid>
            </div>
          </div>

          {!!(user || useShippingAddress) && (
            <div className={style.btns}>
              <div>
                <GhostArrowBtn
                  className={`${style.btns}__prev`}
                  disabled={initializing || isProcessing}
                  data-selenium="payment-back"
                  backgroundcolor="transparent"
                  onClick={() => {
                    if (isServiceOrder) {
                      router.goBack();
                    } else if (order.state === 'address') {
                      router.push(getUrl('checkout-shipping-address'));
                    } else {
                      router.push(getUrl('checkout-shipping-method'));
                    }
                  }}
                  text="Back"
                  hasArrow={false}
                />
              </div>

              {this.renderSubmitButton({
                paymentMethod,
                order,
                initializing,
                isProcessing,
                stripeOptions,
                checked,
              })}
            </div>
          )}

          {(initializing || isProcessing) && (
            <div className={style.mask}>
              <Spinner />
            </div>
          )}
        </Elements>
      </div>
    );
  }
}
