import React from 'react';
import logoAfterPay from 'containers/Checkout/images/stripe-afterpay-mint.png';
import logoZip from 'containers/Checkout/images/zip.svg';
import PropTypes from 'prop-types';
import { toPrice } from 'utils/number';
import { useZIP } from '../hooks/price';
import style from './style.scss';

const DisplayPaymentMethodMessaging = ({ price }, { frame }) => {
  const [zipBtnRef, handleZipLabelClick] = useZIP();
  const showAfterpay = price <= 3000;

  const openAfterpayModal = () => {
    frame.openModal('afterpay');
  };

  const zipModal = (
    // https://developers.zip.co/docs/product-cart-widget#product-page-messaging-implementation
    <>
      <div data-zm-merchant={__ZIP_PUBLIC_KEY__} data-env="production" />
      <div
        ref={zipBtnRef}
        className={`${style.onlyZip}__btn`}
        data-zm-asset="productwidget"
        data-zm-widget="popup"
        data-zm-popup-asset="termsdialog"
        data-zm-price={price}
        aria-hidden="true"
      />
    </>
  );

  if (price > 5000) {
    return null;
  }

  if (!showAfterpay && __ZIP_ENABLED__) {
    return (
      <div className={style.onlyZip}>
        <span
          role="button"
          className={`${style.onlyZip}__label`}
          onClick={handleZipLabelClick}
          data-selenium="installment_expand"
        >
          {price <= 1000
            ? 'from $10 per week'
            : `$${(price / 12 / 4.33).toFixed(2)} weekly for 12 months, $9.95 monthly fees apply `}
        </span>
        <span
          style={{ display: 'inline-block' }}
          onClick={handleZipLabelClick}
          role="button"
          data-selenium="installment_expand"
        >
          <img src={logoZip} className={`${style.onlyZip}__logo`} alt="zip" />
        </span>

        {zipModal}
      </div>
    );
  }

  return (
    <div className={style.displayPaymentMethodMessaging}>
      <div className={`${style.displayPaymentMethodMessaging}__badge`}>
        {showAfterpay && (
          <div role="button" className={`${style.displayPaymentMethodMessaging}__afterpay`} onClick={openAfterpayModal}>
            <img
              src={logoAfterPay}
              className={`${style.displayPaymentMethodMessaging}__afterpay__logo`}
              alt="afterpay"
            />
          </div>
        )}

        {__ZIP_ENABLED__ && (
          <div className={`${style.displayPaymentMethodMessaging}__zip`}>
            <div
              className={`${style.displayPaymentMethodMessaging}__zip-logo`}
              onClick={handleZipLabelClick}
              role="button"
              data-selenium="installment_expand"
            >
              <img src={logoZip} alt="zip" />
            </div>

            {zipModal}
          </div>
        )}
      </div>

      {showAfterpay && (
        <div className={`${style.displayPaymentMethodMessaging}__afterpay__description`}>
          <div role="button" onClick={openAfterpayModal}>
            4 interest-free payments of {toPrice(price / 4)}
          </div>
        </div>
      )}
    </div>
  );
};
DisplayPaymentMethodMessaging.propTypes = {
  price: PropTypes.number,
};
DisplayPaymentMethodMessaging.contextTypes = {
  frame: PropTypes.object,
};
export default DisplayPaymentMethodMessaging;
