import React, { useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { getUrl } from 'pages';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import { loadIfNeeded as loadInstalment } from 'redux/modules/instalment';

import logoOCBC from 'containers/Product/images/ocbc.png';
import logoUOB from 'containers/Product/images/uob.png';
import logoAMEX from 'containers/Product/images/amex.png';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInAU, globalFeatureInUS } from 'config';
import { useCurrentProduct, useMobileFrame } from '../hooks/product';
import { useAFFIRM, usePrice } from '../hooks/price';
import DisplayPaymentMethodMessaging from './DisplayPaymentMethodMessaging';
import style from './style.scss';
import ProductTCC from './ProductTCC';

const logos = {
  OCBC: logoOCBC,
  UOB: logoUOB,
  AMEX: logoAMEX,
  DBS: require('containers/Checkout/images/dbs.png'),
  POSB: require('containers/Checkout/images/posb.png'),
};

const Instalment = ({ closeHandler, instalment, price, handleDesktopClose }) => {
  const { desktop } = useBreakpoints();
  return (
    <div role="menuitem" className={style.instalmentModal} onClick={closeHandler}>
      <div className={`${style.instalmentModal}__container`}>
        <h3>Enjoy 0% INSTALMENT</h3>
        <p>
          Applicable for <strong>online purchases</strong> only. Regarding instalment plans for in-store purchases,
          speak to our sales consultants.
        </p>
        <div className={`${style.instalmentModal}__block`}>
          <p>
            Please note that a minimum spend of <strong>$500</strong> is required for instalment plans when using a DBS,
            OCBC, UOB, or AMEX Credit Card.*
            {/* For online purchases over <strong>$500</strong> using an DBS, OCBC, UOB or AMEX card.* */}
          </p>
          <table className="table table-bordered">
            <tbody>
              {instalment.ipp_options?.map((option) => (
                <React.Fragment key={option.bank_code}>
                  {option.options.map((o, index) => (
                    <tr key={o.period}>
                      {index === 0 && (
                        <td rowSpan={option.options.length}>
                          <img
                            src={logos[option.bank_code?.toUpperCase()]}
                            className={option.bank_code?.toUpperCase()}
                            alt={option.bank}
                          />
                          {option.bank_code?.toUpperCase() === 'DBS' && (
                            <img src={logos.POSB} alt="POSB" className="POSB" />
                          )}
                        </td>
                      )}
                      <td>
                        {toPrice(price / o.period)}&nbsp; x &nbsp;
                        {o.period} months
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${style.instalmentModal}__tc`}>
          *View <Link to={getUrl('sales-and-refunds')}>Terms & Conditions</Link>
        </div>
      </div>
      {desktop ? (
        <button
          type="button"
          className={`${style.instalmentModal}__drawer__dismiss`}
          onClick={handleDesktopClose}
          data-selenium="installment_close"
        >
          <ReactSVG name="dismiss" />
        </button>
      ) : null}
    </div>
  );
};

Instalment.propTypes = {
  closeHandler: PropTypes.func,
  instalment: PropTypes.object,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  handleDesktopClose: PropTypes.func,
};

const Price = ({ className, instalment, loadInstalment: dispatchLoadInstalment }) => {
  useAFFIRM();

  const product = useCurrentProduct();

  const { price, listPrice } = usePrice();

  const { frame, eventClose } = useMobileFrame();
  const { desktop } = useBreakpoints();

  const dispatch = useDispatch();

  useEffect(() => {
    if (__INSTALMENT_ENABLED__) {
      dispatchLoadInstalment();
    }
  }, [dispatchLoadInstalment]);

  // when user clicks on buy now pay later link below Product Price on product pages
  const trackInstalment = useCallback(
    (label) => {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'bnpl',
          label,
        },
      });
    },
    [dispatch]
  );

  useEffect(() => {
    const popupObserver = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (
          mutation.addedNodes?.[0]?.className === 'affirm-sandbox-container' ||
          mutation.addedNodes?.[0]?.className === 'zip-widget__popup__overlay'
        ) {
          trackInstalment('expand');
        }
        if (
          mutation.removedNodes?.[0]?.className === 'affirm-sandbox-container' ||
          mutation.removedNodes?.[0]?.className === 'zip-widget__popup__overlay'
        ) {
          trackInstalment('close');
        }
      });
    });

    popupObserver.observe(document.body, { childList: true });
    return () => popupObserver.disconnect();
  }, [trackInstalment]);

  const showInstalment = useCallback(() => {
    trackInstalment('expand');

    if (!desktop) {
      frame.openModal(
        'mobileModal',
        {
          content: <Instalment price={price} instalment={instalment} />,
          closeHandler: () => {
            trackInstalment('close');
          },
          styleOverflow: 'scroll',
          closeDataSelenium: 'installment_close',
        },
        {
          height: 80,
          dismiss: () => {
            frame.removeModal();
            trackInstalment('close');
          },
        }
      );
    } else {
      frame.addModal(
        <Instalment
          price={price}
          instalment={instalment}
          closeHandler={eventClose}
          handleDesktopClose={() => {
            frame.removeModal();
            trackInstalment('close');
          }}
        />,
        'side',
        {
          dismiss: () => {
            frame.removeModal();
            trackInstalment('close');
          },
          position: 'right',
          maxWidth: 500,
        }
      );
    }
  }, [frame, eventClose, price, instalment, trackInstalment, desktop]);

  return (
    <div className={classNames(style.price, className)}>
      {price !== undefined ? (
        <span
          data-selenium="product-price"
          className={classNames(`${style.price}__base`, {
            [`${style.price}__base--sale`]: listPrice !== price,
          })}
        >
          {toPrice(price)}
        </span>
      ) : (
        <div className={style.estimating}>
          <span className={`${style.price}__base`}>l</span>
        </div>
      )}
      {price !== undefined && listPrice !== price && listPrice !== undefined && (
        <span className={`${style.price}__reg`}>{toPrice(listPrice, true)}</span>
      )}

      {globalFeatureInAU && <DisplayPaymentMethodMessaging price={price} />}

      {globalFeatureInUS && __AFFIRM_ENABLED__ && (
        <div className={`${style.price}__affirm`}>
          <span
            className="affirm-as-low-as"
            data-page-type="product"
            data-amount={Math.floor((price * 100).toFixed(2))}
          />
        </div>
      )}
      {__INSTALMENT_ENABLED__ && price !== undefined && price >= 500 && instalment && (
        <span className={`${style.price}__instalment`}>
          <a role="button" onClick={showInstalment} data-selenium="installment_expand">
            As low as&nbsp;
            {toPrice(
              price / Math.max(...instalment.ipp_options.map((bank) => Math.max(...bank.options.map((o) => o.period)))),
              true
            )}
            &nbsp; / month
          </a>
        </span>
      )}
      {product.min_sale_qty >= 2 && (
        <p className={`${style.price}__note`}>
          The above price is the price of {product.min_sale_qty} chairs. Sold only in multiples of{' '}
          {product.min_sale_qty}
        </p>
      )}
      <ProductTCC />
    </div>
  );
};

Price.propTypes = {
  className: PropTypes.string,
  loadInstalment: PropTypes.func,
  instalment: PropTypes.object,
};

export default connect((state) => ({ instalment: state.instalment.data }), {
  loadInstalment,
})(Price);
