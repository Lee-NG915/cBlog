import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import { useSelector, useDispatch } from 'react-redux';
import { approveGrabPay } from 'redux/modules/cart';
import { getUrl } from 'pages';
import Spinner from 'components/Spinner';
import { Link } from 'react-router';
import { EVENT_CHECKOUT } from 'utils/track/constants';

import { trackPayment } from 'utils/tracking';
import { Container } from '@castlery/fortress';
import Footer from './components/Footer';
import Header from './components/Header';

import style from './style.scss';

const grabPayErrors = {
  user_canceled: 'You have cancelled GrabPay transaction. Let us know if you have faced any issues.',
  session_expired: 'The session for this transaction has expired.',
  transaction_declined: 'Transaction was declined.',
  insufficient_balance:
    'Transaction could not be completed due to an insufficient balance on the your selected payment method.',
  unknown: 'Transaction could not be processed in time. As a result, the transaction will be cancelled.',
};

const ConfirmGrabPay = ({ location, router }) => {
  const {
    pathname,
    query: { code: grabPayCode, state: grabPayState, error: grabPayError },
  } = location;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const cart = useSelector((store) => store.cart);
  const { processing, data: order } = cart;

  const dispatch = useDispatch();
  const approve = useCallback((data) => dispatch(approveGrabPay(data)), [dispatch]);

  useEffect(() => {
    // redirect from GrabPay
    if (grabPayState) {
      if (grabPayCode) {
        approve({ checkout: { code: grabPayCode, state: grabPayState } })
          .then((result) => {
            trackPayment(result, 'grabpay');

            dispatch({
              type: EVENT_CHECKOUT,
              result: {
                checkoutStep: 5,
                paymentMethod: 'grabpay',
              },
            });

            router.replace(getUrl('checkout-success'));
            setLoading(false);
          })
          .catch((errors) => {
            setError(errors?.[0]?.detail);
            setLoading(false);
          });
      } else if (grabPayError) {
        const errorMessage = grabPayErrors[grabPayError] || 'Something went wrong.';
        setError(errorMessage);
        setLoading(false);
      }
    }
  }, [approve, error, grabPayCode, grabPayError, grabPayState, router]);

  return (
    <div className={style.wrapper}>
      <Helmet path={pathname} page={{ title: 'GrabPay' }} />
      <Header />
      <div className={style.tctp}>
        <Container fixed>
          {loading || processing ? (
            <div className={`${style.tctp}__loading`}>
              <div>
                <Spinner />
              </div>
              <p>We're processing your order, please wait a second.</p>
            </div>
          ) : (
            <div className={`${style.tctp}__error`}>
              {error && <p>{error}</p>}
              <Link to={getUrl('checkout-payment')} className="btn btn-primary-outline">
                Please Try Again
              </Link>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
};

ConfirmGrabPay.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    query: PropTypes.shape({
      code: PropTypes.string,
      state: PropTypes.string,
      error: PropTypes.string,
    }),
  }),
  router: PropTypes.shape({
    replace: PropTypes.func,
  }),
};

export default ConfirmGrabPay;
