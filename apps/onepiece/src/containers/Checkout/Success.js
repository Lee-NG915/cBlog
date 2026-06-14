import React, { useEffect, useRef } from 'react';
import { getMaxDate, getDate } from 'utils/time';
import Banner from 'components/Banner';
import Helmet from 'components/Helmet';
import { remove } from 'helpers/Cookie';
import { load as loadCart, clear } from 'redux/modules/cart';
import { trackPayment } from 'utils/tracking';
import { getUrl } from 'pages';
import { Button, GhostArrowBtn } from 'components/Button';
import { EVENT_CHECKOUT, EVENT_TRANSACTION } from 'utils/track/constants';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Typography } from '@castlery/fortress';
import { couponAutoApplyFlag } from 'components/OrderSummary/util';
import Footer from './components/Footer';
import Header from './components/Header';

import style from './style.scss';

const images = [
  {
    breakpoint: 'xs',
    srcset: '/static/our-story/edition2/ourstory-3-mobile.jpg',
    loader: { ratio: 1 },
  },
  {
    breakpoint: 'lg',
    srcset: '/static/our-story/edition2/ourstory-3.jpg',
    loader: { ratio: 1.284 },
  },
];

const Success = ({ location }) => {
  const dispatch = useDispatch();
  const { query } = location;
  const order = useSelector((state) => state.cart.data);
  // const user = useSelector((state) => state.auth.user);
  const orderNumberRef = useRef(order?.reference_number || '');
  const pathNumberRef = useRef(order?.number || '');
  useEffect(() => {
    const trackOrderComplete = (result) => {
      dispatch({ type: EVENT_CHECKOUT, result });
    };

    if (order && order.state === 'complete') {
      try {
        if (query && query[orderNumberRef.current]) {
          // FIXME: No tags fired for event: purchase
          trackPayment(order, query.paymentMethod);

          trackOrderComplete({
            checkoutStep: 5,
            paymentMethod: query.paymentMethod,
          });
        }
      } catch (err) {
        console.error(
          JSON.stringify(
            {
              message: 'Checkout success error',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        );
      }

      // clear cache
      remove('order_token');
      remove('order_id');
      remove('castlery_podcast');
      couponAutoApplyFlag.clear();

      const total = order?.total;
      if (total > 0 && !__DEVELOPMENT__ && __GOOGLE_REVIEW_ENABLED__) {
        const email = order?.email;
        let deliveryDate = order?.shipments
          ? getMaxDate(order.shipments.map((s) => getDate(s.estimated_dispatch_date)))
              .add(6, 'd')
              .format('YYYY-MM-DD')
          : null;
        if (!__APPLICATION_ENV__.includes('prod')) {
          // not prod env, set delivery date to tomorrow
          deliveryDate = getDate().add(1, 'd').format('YYYY-MM-DD');
        }

        window.renderOptIn = () => {
          window.gapi.load('surveyoptin', () => {
            window.gapi.surveyoptin.render({
              merchant_id: __GOOGLE_MERCHANT_ID__,
              order_id: orderNumberRef.current,
              email,
              delivery_country: __COUNTRY__,
              estimated_delivery_date: deliveryDate,
            });
          });
        };

        // load script
        const s = document.createElement('script');
        // FIXME can use Script Component
        s.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }

      dispatch({ type: EVENT_TRANSACTION });
      // clear cart state
      dispatch(clear());
      // load cart to create a new order
      loadCart(false, true)(dispatch);
    }
  }, [dispatch, order, query]);

  const pathname = getUrl('checkout-success');
  return (
    <div className={style.wrapper}>
      <Helmet path={pathname} />
      {/* NOTE: Yotpo is no longer enabled https://app.clickup.com/t/86eu2a1up */}
      {/* <YotpoScript /> */}
      <Header className={`${style.success}__header`} />

      <Container fixed className={`${style.success}`} sx={{ '--fortress-fontFamily-body': 'Aime', fontFamily: 'Aime' }}>
        <div className={`${style.success}__left`}>
          <Typography level="h1">We've Received Your Order!</Typography>

          <Typography level="subh1" sx={{ mt: '16px' }}>{`Order Number #${orderNumberRef.current}`}</Typography>

          <Typography level="body1" sx={{ mt: '16px' }}>
            Thanks for choosing Castlery. We're processing your order as soon as possible.
            <br />
            An order confirmation email will be sent shortly.
          </Typography>

          <div className={`${style.success}__btn`}>
            <GhostArrowBtn
              text="View Order Details"
              color="dark-accent"
              hasArrow={false}
              backgroundcolor="transparent"
              className={`${style.success}__viewOrder`}
              // href={`${getUrl('order-details')}?number=${pathNumberRef.current}`}
              href={`${__BASE_URL__}/account/order-details?number=${pathNumberRef.current}`}
            />

            <Button
              text="Continue Shopping"
              className={`${style.success}__shoppingBtn`}
              backgroundcolor="transparent"
              hasArrow={false}
              href={__BASE_URL__}
              style={{
                lineHeight: '48px',
              }}
            />
          </div>

          {__FRIENDBUY_ENABLED__ && <div id="friendbuyconfirmation" className={`${style.success}__referral`} />}
        </div>

        <div className={`${style.success}__right`}>
          <Banner className={`${style.success}__banner`} mediaQueries={images} title="Order Confirmation" />
        </div>
      </Container>

      {/* NOTE: Yotpo is no longer enabled https://app.clickup.com/t/86eu2a1up */}
      {/* {__YOTPO_ENABLED__ && (
        <div className="yotpo-widget-instance" data-yotpo-instance-id={__YOTPO_REFERRAL_POPUP_ID__} />
      )} */}

      <Footer />
    </div>
  );
};

export default Success;
