import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import OrderSummary from 'components/OrderSummary';
import OrderSummaryV2 from 'components/OrderSummary/indexV2';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { refreshPrice } from 'redux/modules/cart';
import Spinner from 'components/Spinner';
import { EVENT_CART_REFRESH_CLICK } from 'utils/track/constants';
import { Box } from '@castlery/fortress';
import config from 'config';
import CheckoutBtn from './CheckoutBtn';
import CheckoutBtnV2 from './CheckoutBtnV2';
import CartRecommendation from './CartRecommendation';
import style from './style.scss';

const CartBody = ({ recommendations, bodyComponent }, { frame }) => {
  const cart = useSelector((state) => state.cart);
  const order = cart.data;
  const dispatch = useDispatch();
  const outdatedItems = order?.line_items?.filter((item) => item.is_price_outdated);
  const [showRefresh, setShowRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loading = isRefreshing && (cart.loading || cart.creating || cart.processing);

  useEffect(() => {
    setShowRefresh(outdatedItems?.length > 0);
  }, [outdatedItems]);

  const handleRefresh = () => {
    if (loading) return false;
    dispatch({ type: EVENT_CART_REFRESH_CLICK });
    setIsRefreshing(true);
    dispatch(refreshPrice())
      .then(() => {
        setShowRefresh(false);
      })
      .catch((error) => frame.openModal('response', { body: error }))
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  return (
    <div className={style.cartBody}>
      <Box data-campaign="cart-messagings-minicart-top" pt={2} px="15px" />
      <div className={`${style.cartBody}__header`}>
        <div className={`${style.cartBody}__title`}>
          {order?.line_items?.length > 0 ? (
            <div className={`${style.cartBody}__title__desc`}>
              <span className={`${style.cartBody}__title__desc__icon`}>
                <ReactSVG name="check-circle-fill" />
              </span>

              <span>
                {order.item_count} item
                {order.item_count > 1 && 's'} added to your cart
              </span>
            </div>
          ) : (
            <span>Your cart</span>
          )}
        </div>

        <div>
          {showRefresh && (
            <button
              type="button"
              className={classNames(`btn ${style.cartBody}__refresh`, {
                'is-loading': loading,
              })}
              onClick={handleRefresh}
            >
              <span>Refresh</span> <ReactSVG name="reset" />
            </button>
          )}

          <button
            type="button"
            className={`btn ${style.cartBody}__close`}
            onClick={() => frame.removeModal()}
            data-selenium="close-cart"
          >
            <ReactSVG name="close" />
          </button>
        </div>
      </div>

      <div className={`${style.cartBody}__mainWrapper`}>
        <div>
          {bodyComponent}
          {loading && (
            <div className={`${style.cartBody}__loading`}>
              <Spinner />
            </div>
          )}
        </div>

        <div className={classNames(style.footer, 'is-variationB')}>
          {config.enableNewPromotion ? (
            <OrderSummaryV2 expandable defaultExpand showMask={false} />
          ) : (
            <OrderSummary expandable defaultExpand showMask={false} />
          )}
          {config.enableNewPromotion ? <CheckoutBtnV2 fromModal /> : <CheckoutBtn fromModal />}

          {order?.line_items?.length > 0 && (
            <div
              className={`${style.cartBody}__continue`}
              onClick={() => {
                frame.removeModal();
              }}
              role="button"
            >
              Continue Shopping
            </div>
          )}
        </div>

        <div className={`${style.cartBody}__footer`}>
          <CartRecommendation data={recommendations} />
        </div>
      </div>
    </div>
  );
};

CartBody.propTypes = {
  recommendations: PropTypes.object,
  bodyComponent: PropTypes.element,
};
CartBody.contextTypes = {
  frame: PropTypes.object,
};
export default CartBody;
