import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Cart from 'components/Cart';
import { useSelector, useDispatch } from 'react-redux';
import { load } from 'redux/modules/cart';
import { getUrl } from 'pages';
import { EVENT_PAGE_VIEW } from 'utils/track/constants';
import { getLastPageView } from 'utils/track/common';
import { gtmPageNames } from 'utils/track/config';

const CartModal = ({ loadCart }) => {
  const historyViews = useSelector((state) => state.tracking.historyViews);
  const dispatch = useDispatch();
  const lastPageView = getLastPageView(historyViews);

  const trackPageView = (result) =>
    dispatch({
      type: EVENT_PAGE_VIEW,
      result,
    });

  useEffect(() => {
    if (loadCart) {
      setTimeout(() => {
        dispatch(load(false, true))
          .catch((e) => {
            console.log(`==============>e`);
            console.log(e);
          })
          .finally(() => {
            trackPageView({
              pathname: getUrl('cart'),
              pageName: gtmPageNames.cartPage,
            });
          });
      }, 0);
    } else {
      trackPageView({
        pathname: getUrl('cart'),
        pageName: gtmPageNames.cartPage,
      });
    }

    return () => {
      setTimeout(() => {
        // nextPageView may be cart view or checkout view
        const nextPageView = getLastPageView(historyViews);
        const { pathname } = nextPageView;
        if (pathname === getUrl('cart')) {
          trackPageView({
            ...lastPageView,
          });
        }
      });
    };
  }, []);

  return <Cart />;
};

CartModal.animation = 'side';

CartModal.animationOptions = {
  position: 'right',
  maxWidth: 500,
};

CartModal.propTypes = {
  loadCart: PropTypes.bool,
};

CartModal.defaultProps = {
  loadCart: false,
};

export default CartModal;
