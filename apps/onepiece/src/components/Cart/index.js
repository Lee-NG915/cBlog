import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { add as addToCart } from 'redux/modules/cart';
import { trackSPAEvent, trackLastSPAContext } from 'utils/tracking';
import { animate } from 'utils/animate';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import Script from 'components/Script';
import CreditsBanner from 'components/Cart/CreditsBanner';
import { EVENT_VIEW_CART } from 'utils/track/constants';
import config from 'config';
import CartItem from './CartItem';
import PromotionHint from './PromotionHint';
import PromotionHintV2 from './PromotionHintV2';
import CartBody from './CartBody';
import style from './style.scss';
import ZipCodeBanner from './ZipCodeBanner';
import CartItemV2 from './CartItemV2';

const Cart = (props, { frame }) => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const [showUndo, setShowUndo] = useState(false);
  const [hadInitMulberry, setHadInitMulberry] = useState(false);
  const [undoItem, setUndoItem] = useState({});
  const dispatch = useDispatch();
  const containerRef = useRef();
  const destinationRef = useRef();
  const points = useSelector((state) => state.yotpo.customerYotpoPoints);
  const [hasTrackCartView, setHasTrackCartView] = useState(false);
  let timer;

  useEffect(() => {
    if (user) {
      dispatch(loadYotpoDetails());
    }
  }, [user, dispatch]);

  useEffect(() => {
    trackSPAEvent({
      pageType: 'cart',
      cart: cart.data,
    });
    return () => {
      trackLastSPAContext();
      clearTimeout(timer);
      if (__MULBERRY_PUBLIC_TOKEN__ !== '' && window?.mulberry?.modal) window.mulberry.modal.instances = [];
    };
  }, [cart.data, timer]);

  useEffect(() => {
    trackSPAEvent({
      pageType: 'cart',
      cart: cart.data,
      countAsPageView: false,
    });
  }, [cart.data]);

  useEffect(() => {
    // view_cart event for GA, triggered once the cart is loaded
    if (!hasTrackCartView) {
      dispatch({ type: EVENT_VIEW_CART });
      setHasTrackCartView(true);
    }
  }, [cart.data, hasTrackCartView, setHasTrackCartView, dispatch]);

  const handleShowUndo = (data) => {
    setShowUndo(data.showUndo);
    setUndoItem(data.undoItem);

    if (data.showUndo) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setShowUndo(false);
      }, 5000);
    }
  };

  const handleUndo = () => {
    const selectedVariants = {};
    if (undoItem.bundle_line_items?.length > 0) {
      undoItem.bundle_line_items.forEach((item) => {
        selectedVariants[item?.bundle_option?.id] = {
          id: item?.variant?.id,
        };
      });
    }

    dispatch(
      addToCart({
        product: undoItem,
        variant: undoItem.variant,
        quantity: undoItem.quantity,
        selectedVariants,
      })
    )
      .then(() => {
        setShowUndo(false);

        if (containerRef?.current && destinationRef?.current) {
          animate({
            from: containerRef.current.scrollTop,
            to: destinationRef.current.offsetHeight,
            duration: 300,
            func: 'easeInOutCubic',
            callback: (d) => {
              containerRef.current.scrollTop = d;
            },
          });
        }
      })
      .catch((error) => frame.openModal('response', { body: error }));
  };

  const order = cart.data;
  const showZipBanner = React.useMemo(
    () => config.enabledZipcodeFeature && !!(order && Array.isArray(order?.line_items) && order.line_items.length),
    [order]
  );

  let bodyComponent = null;
  if (order) {
    const cartItemsComponent =
      order.line_items.length > 0 ? (
        <>
          {__MULBERRY_PUBLIC_TOKEN__ && (
            <Script
              src={__MULBERRY_SDK__}
              onLoad={() => {
                window.mulberry.core.init({
                  publicToken: __MULBERRY_PUBLIC_TOKEN__,
                });
              }}
              onReady={() => {
                setHadInitMulberry(true);
              }}
            />
          )}
          <div style={{ flex: 'auto' }} ref={destinationRef}>
            {order.line_items.map((item) =>
              config.enableNewPromotion ? (
                <CartItemV2
                  key={item.id}
                  item={item}
                  className={`${style.body}__item`}
                  processing={cart.processing}
                  handleShowUndo={handleShowUndo}
                  showMask={false}
                  hadInitMulberry={hadInitMulberry}
                />
              ) : (
                <CartItem
                  key={item.id}
                  item={item}
                  className={`${style.body}__item`}
                  processing={cart.processing}
                  handleShowUndo={handleShowUndo}
                  showMask={false}
                  hadInitMulberry={hadInitMulberry}
                />
              )
            )}
          </div>
        </>
      ) : (
        <div className={`${style.body}__empty`} ref={destinationRef}>
          Your cart is empty.
        </div>
      );

    const promotionHintComponent =
      order.line_items.length > 0 ? config.enableNewPromotion ? <PromotionHintV2 /> : <PromotionHint /> : null;

    bodyComponent = (
      <div className={`${style.cart}__main`}>
        <div className={style.body} ref={containerRef}>
          <div style={{ marginBottom: '16px' }}>{promotionHintComponent}</div>
          {showZipBanner && <ZipCodeBanner />}
          {showUndo && (
            <div className={`${style.body}__undo`}>
              <span>Product has been removed from cart</span>

              <a role="button" onClick={handleUndo}>
                Undo
              </a>
            </div>
          )}
          {/* ================= loyalty credits banner ================ */}
          {!!user && <CreditsBanner points={points} />}
          {/* ================= loyalty credits banner ================ */}
          {cartItemsComponent}
        </div>
      </div>
    );
  } else {
    bodyComponent = (
      <div className={style.body}>
        <div className={`${style.body}__empty`}>Your cart is empty.</div>
      </div>
    );
  }

  return (
    <div className={style.cart}>
      <CartBody bodyComponent={bodyComponent} />
    </div>
  );
};

Cart.contextTypes = {
  frame: PropTypes.object,
};
export default Cart;
