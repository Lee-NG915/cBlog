/* eslint-disable camelcase */
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { CardTwo } from 'components/Card';
import { toPrice } from 'utils/number';
import { SvgIcon } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import config from 'config';
import InstalmentForm from './InstalmentForm';
import style from './style.scss';

import imageCreditCard from '../images/creditcard.png';
import imagePaypal from '../images/paypal.png';
import imageZip from '../images/zip.svg';
import imageAffirm from '../images/affirm.png';
import imageGrabPay from '../images/grabpay.png';
import imageGooglePay from '../images/google-pay.png';
import imageApplePay from '../images/apple-pay.svg';
import imageStripeAfterPay from '../images/stripe-afterpay-mint.png';
import { useOptions, usePaymentRequest } from './stripeElementHook';
import { PAYMENT_METHOD, WALLETS_PAYMENT_METHOD } from '../constant';

const PaymentCard = ({ type, paymentMethod, changePaymentMethod, titleSelenium, titleContent, mainContent }) => (
  <CardTwo
    type="payment"
    titleDirection="top"
    onSelect={() => {
      if (paymentMethod !== type) {
        changePaymentMethod(type);
      }
    }}
    disabled={paymentMethod === type}
    isSelected={paymentMethod === type}
    titleSelenium={titleSelenium}
    titleContent={titleContent}
    bodyClassName={classNames(`${style.paymentMethod}__main`, {
      'is-hidden': paymentMethod !== type,
    })}
    mainContent={mainContent}
  />
);
PaymentCard.propTypes = {
  type: PropTypes.string,
  paymentMethod: PropTypes.string,
  changePaymentMethod: PropTypes.func,
  titleSelenium: PropTypes.string,
  mainContent: PropTypes.element,
  titleContent: PropTypes.element,
};

const WalletTypeIcon = ({ walletType }) => {
  switch (walletType) {
    case PAYMENT_METHOD.applePay:
      return <img src={imageApplePay} alt="pay with wallets" />;
    case PAYMENT_METHOD.googlePay:
      return <img src={imageGooglePay} alt="pay with wallets" />;
    case PAYMENT_METHOD.link:
      return (
        <SvgIcon viewBox="0 0 56 25" fill="#1D3944" focusable="false">
          <title>Link logo</title>
          <path d="M8.302 2.25c0-1.24.998-2.25 2.25-2.25a2.26 2.26 0 0 1 2.25 2.25c0 1.24-1.01 2.25-2.25 2.25s-2.25-1.01-2.25-2.25ZM.565.241h4.017v24.286H.565V.24ZM54.842 7.199c-2.315 4.95-4.905 8.538-4.905 8.538l5.498 8.79h-4.74l-3.38-5.41c-3.403 3.873-6.772 5.772-10.02 5.772-3.962 0-5.575-2.831-5.575-6.047 0-.357.003-.796.006-1.22v-.003c.003-.396.005-.78.005-1.07 0-4.247-.45-5.454-1.876-5.257-2.744.373-6.925 6.628-9.646 13.235h-3.776V7.199h4.017v8.647c2.294-3.863 4.379-7.166 7.759-8.45 1.964-.746 3.62-.428 4.477-.043 3.105 1.371 3.105 4.73 3.062 9.218 0 .285-.003.581-.006.888v.001c-.002.328-.005.668-.005 1.02 0 1.635.45 2.348 1.558 2.458a3.228 3.228 0 0 0 1.898-.417V.241H43.2v17.394s3.49-3.182 7.166-10.436h4.477ZM12.56 7.199H8.543v17.328h4.017V7.199Z" />
        </SvgIcon>
      );

    default:
      break;
  }
};
WalletTypeIcon.propTypes = {
  walletType: PropTypes.oneOf(WALLETS_PAYMENT_METHOD),
};

/**
 * render payment method option and initiate payment request
 */
const WalletsPaymentMethod = React.memo(
  ({ changePaymentMethod, paymentMethod, paymentRequestOnReady, onPaymentMethod }) => {
    const cart = useSelector((state) => state.cart);
    const { currency, total } = cart.data || {};

    // FIXME: 当用户选择 钱包支付时 支付按钮已经渲染出来
    // 此时添加优惠券时金额会发生变化 正常来说 已经生成了新的 paymentRequest 对象
    // 但是支付按钮并没有重新生成一个新的实例 具体原因 还没去看
    // 所以 暂时使用现在这种取巧的方式 先把支付方式切换成 信用卡支付
    // 当用户重新选择钱包支付时 再次渲染支付按钮
    // 这个问题会在后续版本中解决
    useEffect(() => {
      changePaymentMethod('stripe', true);
    }, [total, changePaymentMethod]);

    const requestOptions = useMemo(
      () => ({
        country: config.stripeIntlConfig.country,
        currency: currency.toLocaleLowerCase(),
        // https://stripe.com/docs/js/appendix/payment_item_object
        total: {
          label: 'Castlery',
          // The amount in the currency's subunit (e.g. cents, yen, etc.)
          amount: Math.floor((total * 100).toFixed(2)),
          //  If you might change this amount later (for example, after you have calcluated shipping costs), set this to true.
          // pending: true,
        },
        requestPayerName: true,
        // FIXME 代码传递信息
        requestPayerEmail: true,
      }),
      [currency, total]
    );

    const { paymentRequest, walletType = '' } = usePaymentRequest({
      // https://stripe.com/docs/js/payment_request/create#stripe_payment_request-options
      options: requestOptions,
      onPaymentMethod,
    });

    const options = useOptions(paymentRequest);

    useEffect(() => {
      if (paymentRequest) {
        paymentRequestOnReady(options);
      }
    }, [options, paymentRequestOnReady, paymentRequest]);

    // no wallet is available
    if (!paymentRequest) {
      return null;
    }

    return (
      <PaymentCard
        type={walletType}
        changePaymentMethod={changePaymentMethod}
        paymentMethod={paymentMethod}
        titleSelenium="payment-wallets"
        titleContent={
          <div className={`${style.paymentMethod}__title`}>
            <div className={`${style.paymentMethod}__icon`}>
              <WalletTypeIcon walletType={walletType} />
            </div>
            <div className={`${style.paymentMethod}__label`}>{walletType}</div>
          </div>
        }
        mainContent={
          <div className={`${style.paymentMethod}__paypal`}>Click on {walletType} button to place your order.</div>
        }
      />
    );
  }
);
WalletsPaymentMethod.propTypes = {
  changePaymentMethod: PropTypes.func,
  paymentMethod: PropTypes.string,
  paymentRequestOnReady: PropTypes.func,
  onPaymentMethod: PropTypes.func,
};

const PaymentMethod = (
  {
    changePaymentMethod,
    paymentMethod,
    stripeError,
    stripeCardElement,
    instalmentRef,
    updateSelectedBank,
    paymentRequestOnReady,
    onPaymentMethod,
  },
  { router }
) => {
  const order = useSelector((state) => state.cart.data);
  const instalment = useSelector((state) => state.instalment);
  const { desktop } = useBreakpoints();

  const isServiceOrder = router.location.query.serviceOrder;
  const showAfterpay = __COUNTRY__ === 'AU' && +order.total <= 3000;
  const instalmentIcons = [
    {
      key: 'DBS',
      value: 'https://res.cloudinary.com/crusader/image/upload/f_auto,q_auto,c_fit/v1691655629/D05.SI_e40gvq.png',
    },
    {
      key: 'OCBC',
      value: 'https://res.cloudinary.com/crusader/image/upload/f_auto,q_auto,c_fit/v1691655629/O39.SI_lvfom6.png',
    },
    {
      key: 'UOB',
      value: 'https://res.cloudinary.com/crusader/image/upload/f_auto,q_auto,c_fit/v1691655629/U11.SI_xofbb9.png',
    },
    {
      key: 'AMEX',
      value: 'https://res.cloudinary.com/crusader/image/upload/f_auto,q_auto,c_fit/v1691655629/AXP_nqzj17.png',
    },
  ];
  const targetInstalmentIcons =
    __COUNTRY__ === 'SG' ? instalmentIcons : instalmentIcons.filter((item) => item.key !== 'DBS' && item);

  return (
    <div className={`${style.paymentMethod}`}>
      <PaymentCard
        type="stripe"
        changePaymentMethod={changePaymentMethod}
        paymentMethod={paymentMethod}
        titleSelenium="payment-stripe"
        titleContent={
          <div className={`${style.paymentMethod}__title`}>
            <div className={`${style.paymentMethod}__icon`}>
              <img src={imageCreditCard} alt="pay with credit card" />
            </div>
            <div className={`${style.paymentMethod}__label`}>Credit card</div>
          </div>
        }
        mainContent={
          <form className={`${style.paymentMethod}__stripe`}>
            <div id="stripe-card-element" ref={stripeCardElement} />

            {stripeError && (
              <div className={`${style.paymentMethod}__stripe__error`} role="alert">
                {stripeError}
              </div>
            )}
          </form>
        }
      />

      {showAfterpay && (
        <PaymentCard
          type={PAYMENT_METHOD.afterPay}
          changePaymentMethod={changePaymentMethod}
          paymentMethod={paymentMethod}
          titleSelenium="payment-afterPay"
          titleContent={
            <div className={`${style.paymentMethod}__title`}>
              <div className={`${style.paymentMethod}__icon`}>
                <img src={imageStripeAfterPay} alt="pay with Afterpay" />
              </div>
              <div className={`${style.paymentMethod}__label`}>
                {!desktop ? 'Afterpay' : `4 interest-free payments of ${toPrice(order.total / 4)}`}
              </div>
            </div>
          }
          mainContent={
            <div className={`${style.paymentMethod}__afterPay`}>
              Click on the 'Place your order' button and you will be redirected to Afterpay to process your order.
            </div>
          }
        />
      )}

      <WalletsPaymentMethod
        changePaymentMethod={changePaymentMethod}
        paymentMethod={paymentMethod}
        paymentRequestOnReady={paymentRequestOnReady}
        onPaymentMethod={onPaymentMethod}
      />
      {__PAYPAL_ENABLED__ && (
        <PaymentCard
          type="paypal"
          changePaymentMethod={changePaymentMethod}
          paymentMethod={paymentMethod}
          titleSelenium="payment-paypal"
          titleContent={
            <div className={`${style.paymentMethod}__title`}>
              <div className={`${style.paymentMethod}__icon`}>
                <img src={imagePaypal} alt="pay with paypal" />
              </div>
              <div className={`${style.paymentMethod}__label`}>Paypal</div>
            </div>
          }
          mainContent={<div className={`${style.paymentMethod}__paypal`}>Click PayPal button to place your order.</div>}
        />
      )}
      {!isServiceOrder && (
        <>
          {__GRABPAY_ENABLED__ && (
            <PaymentCard
              type="grabpay"
              changePaymentMethod={changePaymentMethod}
              paymentMethod={paymentMethod}
              titleSelenium="payment-grabpay"
              titleContent={
                <div className={`${style.paymentMethod}__title`}>
                  <div className={`${style.paymentMethod}__icon`}>
                    <img src={imageGrabPay} alt="pay with grabpay" />
                  </div>
                  <div className={`${style.paymentMethod}__label`}>
                    {!desktop ? 'GrabPay' : 'Checkout with GrabPay'}
                  </div>
                </div>
              }
              mainContent={
                <div className={`${style.paymentMethod}__grabpay`}>
                  Clicking 'Place Your Order' button will take you to GrabPay payment popup page.
                </div>
              }
            />
          )}

          {__ZIP_ENABLED__ && (
            <PaymentCard
              type="zip"
              changePaymentMethod={changePaymentMethod}
              paymentMethod={paymentMethod}
              titleSelenium="payment-zip"
              titleContent={
                <div className={`${style.paymentMethod}__title`}>
                  <div className={`${style.paymentMethod}__icon`}>
                    <img src={imageZip} alt="pay with Zip" />
                  </div>
                  <div className={`${style.paymentMethod}__label`}>
                    {!desktop && 'Zip'}
                    {desktop &&
                      (+order.total <= 1000
                        ? 'from $10 per week'
                        : `$${(+order.total / 12 / 4.33).toFixed(2)} weekly for 12 months, $9.95 monthly fees apply`)}
                  </div>
                </div>
              }
              mainContent={
                <div className={`${style.paymentMethod}__zip`}>
                  <div>Note: </div>
                  Click on the 'Place your order' button and you will be redirected to Zip to process your order.
                </div>
              }
            />
          )}

          {__INSTALMENT_ENABLED__ && ((instalment.loaded && instalment.data) || !instalment.loaded) && (
            <PaymentCard
              type="instalment"
              changePaymentMethod={changePaymentMethod}
              paymentMethod={paymentMethod}
              titleSelenium="payment-2c2p"
              titleContent={
                <div className={`${style.paymentMethod}__title`}>
                  <div className={`${style.paymentMethod}__icon ${style.paymentMethod}__instalment_icons}`}>
                    {targetInstalmentIcons?.map((img) => (
                      <img
                        key={img.key}
                        src={img.value}
                        className={`${style.paymentMethod}__instalment_icons`}
                        alt={img.key}
                      />
                    ))}
                  </div>
                  <div className={`${style.paymentMethod}__label`}>{!desktop ? 'Instalment' : 'Instalment plans'}</div>
                </div>
              }
              mainContent={
                <InstalmentForm ref={instalmentRef} total={+order.total} updateSelectedBank={updateSelectedBank} />
              }
            />
          )}

          {__AFFIRM_ENABLED__ && (
            <PaymentCard
              type="affirm"
              changePaymentMethod={changePaymentMethod}
              paymentMethod={paymentMethod}
              titleDirection="top"
              titleSelenium="payment-affirm"
              titleContent={
                <div className={`${style.paymentMethod}__title`}>
                  <div className={`${style.paymentMethod}__icon`}>
                    <img src={imageAffirm} alt="pay with affirm" />
                  </div>
                  <div className={`${style.paymentMethod}__label`}>Buy Now, Pay Later</div>
                </div>
              }
              mainContent={
                <div className={`${style.paymentMethod}__affirm`}>
                  <p
                    className="affirm-as-low-as"
                    data-page-type="payment"
                    data-amount={Math.floor((order.total * 100).toFixed(2))}
                  />

                  <div className={`${style.paymentMethod}__affirm__desc`}>
                    <div>Pay Over Time</div>
                    <div>Flexible payment options with Affirm, starting at 0% APR. A downpayment may be required.</div>
                  </div>
                  <div className={`${style.paymentMethod}__affirm__desc`}>
                    <div>Flexible Monthly Payment</div>
                    <div>Get a real-time decision with just 5 pieces of info.</div>
                  </div>
                  <div className={`${style.paymentMethod}__affirm__desc`}>
                    <div>See if you are eligible</div>
                    <div>Checking your eligibility won't affect your credit.</div>
                  </div>
                </div>
              }
            />
          )}
        </>
      )}
    </div>
  );
};

PaymentMethod.propTypes = {
  changePaymentMethod: PropTypes.func,
  paymentMethod: PropTypes.string,
  stripeError: PropTypes.string,
  stripeCardElement: PropTypes.object,
  instalmentRef: PropTypes.object,
  updateSelectedBank: PropTypes.func,
  paymentRequestOnReady: PropTypes.func,
  onPaymentMethod: PropTypes.func,
};
PaymentMethod.contextTypes = {
  router: PropTypes.object,
};

export default PaymentMethod;
