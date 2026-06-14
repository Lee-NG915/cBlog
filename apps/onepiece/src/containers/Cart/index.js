import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import config from 'config';
import { load as loadCart, add as addToCart, refreshPrice } from 'redux/modules/cart';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { useSelector, useDispatch } from 'react-redux';
import CartItem from 'components/Cart/CartItem';
import CartItemV2 from 'components/Cart/CartItemV2';
import CheckoutBtn from 'components/Cart/CheckoutBtn';
import CheckoutBtnV2 from 'components/Cart/CheckoutBtnV2';
import OrderSummary from 'components/OrderSummary';
import OrderSummaryV2 from 'components/OrderSummary/indexV2';
import PromotionHint from 'components/Cart/PromotionHint';
import PromotionHintV2 from 'components/Cart/PromotionHintV2';
import CartRecommendation from 'components/Cart/CartRecommendation';
import ZipCodeBanner from 'components/Cart/ZipCodeBanner';
import { animate } from 'utils/animate';
import Script from 'components/Script';
import YotpoScript from 'components/Yotpo';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import * as Cookie from 'helpers/Cookie';
import { getValidateResetPasswordToken } from 'api/users';
import { useAsyncFn, useMount } from 'react-use';
import { selectedUser } from 'redux/modules/auth';
import { EVENT_CART_REFRESH_CLICK, EVENT_VIEW_CART } from 'utils/track/constants';
import CreditsBanner from 'components/Cart/CreditsBanner';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import { useErrorDetail } from './hooks/index';
import style from './style.scss';

const Cart = ({ location }, { frame, router }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const yotpoPoints = useSelector((state) => state.yotpo.customerYotpoPoints);
  const isLoggedIn = useSelector(selectedUser);
  const [hasTrackCartView, setHasTrackCartView] = useState(false);
  const [, handleCheckUserHadResetPWD] = useAsyncFn(async (secret) => {
    const res = await getValidateResetPasswordToken(secret);
    return res;
  }, []);
  useMount(() => {
    //  http://localhost:7777/sg/cart?secret=dyeJj3xQhxyEX-DHLoPx&email=wcdaren%40gmail.com
    if (isLoggedIn) return;
    const { secret } = location.query;
    if (!secret) return;

    handleCheckUserHadResetPWD(secret).then(({ success = false }) => {
      if (success) {
        return router.push({
          pathname: '/reset-password',
          query: {
            ...location.query,
            redirect_page_name: 'cart',
          },
        });
      }
      frame?.openModal('login');
    });
  });

  // Recover from transient SSR failures (e.g. 409 lock on /checkouts/{id}).
  // load() preserves cookies on transient errors; retry once on client when
  // the cart hydrated empty but the order cookie is still present.
  useMount(() => {
    if (cart.loaded && !cart.data && Cookie.get('order_id')) {
      dispatch(loadCart());
    }
  });

  const order = cart.data;
  const [showUndo, setShowUndo] = useState(false);
  const [hadInitMulberry, setHadInitMulberry] = useState(false);
  const [undoItem, setUndoItem] = useState({});
  const destinationRef = useRef();
  const { desktop } = useBreakpoints();

  let timer;

  // const dyState = useSelector((state) => state.dyApiData.campaign);
  // const recommendations = dyState?.['Cart Recommendations']?.data || null;

  const outdatedItems = order?.line_items?.filter((item) => item.is_price_outdated);
  const [showRefresh, setShowRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loading = isRefreshing && (cart.loading || cart.creating || cart.processing);

  useEffect(
    () => () => {
      clearTimeout(timer);
    },
    [timer]
  );
  useEffect(() => {
    if (user) {
      dispatch(loadYotpoDetails());
    }
  }, [user, dispatch]);

  useEffect(() => {
    // view_cart event for GA, triggered once the cart is loaded
    if (!hasTrackCartView) {
      dispatch({ type: EVENT_VIEW_CART });
      setHasTrackCartView(true);
    }
  }, [order, hasTrackCartView, setHasTrackCartView, dispatch]);

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

        if (destinationRef?.current) {
          animate({
            from: document.scrollingElement.scrollTop,
            to: destinationRef.current.offsetHeight,
            duration: 300,
            func: 'easeInOutCubic',
            callback: (d) => {
              document.scrollingElement.scrollTop = d;
            },
          });
        }
      })
      .catch((error) => frame.openModal('response', { body: error }));
  };

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

  const { errorDetail, isShowErrorDetail } = useErrorDetail({ cart, location }) || {};
  const locationState = location?.state;
  let orderOutdatedHint;
  const hasCartItems = order?.line_items?.length > 0;

  if (hasCartItems && errorDetail && isShowErrorDetail) {
    orderOutdatedHint = <div className={`${style.cart}__warning`}>{errorDetail}</div>;
  }

  if (hasCartItems && locationState?.isExpired) {
    orderOutdatedHint = <div className={`${style.cart}__warning`}>Your order has expired. Please checkout again</div>;
  }
  const showZipBanner = React.useMemo(
    () =>
      desktop || __COUNTRY__ === 'SG'
        ? false
        : !!(order && Array.isArray(order?.line_items) && order.line_items.length),
    [desktop, order]
  );

  return (
    <div className={style.cart}>
      <YotpoScript getAPI />

      <Container>
        <div className={`${style.cart}__body`}>
          <div className={`${style.cart}__left`}>
            <div className={`${style.cart}__header`}>
              <h1>Your cart</h1>
              {showRefresh && (
                <div
                  className={classNames(`${style.cart}__header__refresh`, {
                    'is-loading': loading,
                  })}
                  onClick={handleRefresh}
                >
                  <span>Refresh</span> <ReactSVG name="reset" />
                </div>
              )}
            </div>
            <div data-campaign="cart-messagings-fullcart-top" />

            <div className={style.items}>
              <div className={`${style.cart}__hint`}>
                {order &&
                  order.line_items.length > 0 &&
                  (config.enableNewPromotion ? (
                    <PromotionHintV2 showPriceBreakCampaignLabel={desktop} fullCart />
                  ) : (
                    <PromotionHint showPriceBreakCampaignLabel={desktop} />
                  ))}
              </div>
              {showZipBanner && <ZipCodeBanner fullCart />}
              {orderOutdatedHint}
              {showUndo && (
                <div className={`${style.cart}__undo`}>
                  <span>Product has been Removed</span>

                  <a role="button" onClick={handleUndo}>
                    Undo
                  </a>
                </div>
              )}
              {/* ================== loyalty credits banner ================= */}
              {!!user && <CreditsBanner points={yotpoPoints} />}
              {/* ================== loyalty credits banner ================= */}
              <div ref={destinationRef} className={`${style.cart}__items`}>
                {order && order.line_items.length > 0 ? (
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
                    {order.line_items.map((item) =>
                      config.enableNewPromotion ? (
                        <CartItemV2
                          className={`${style.items}__item`}
                          key={item.id}
                          item={item}
                          processing={cart.processing}
                          handleShowUndo={handleShowUndo}
                          showMask
                          hadInitMulberry={hadInitMulberry}
                          fullCart
                        />
                      ) : (
                        <CartItem
                          className={`${style.items}__item`}
                          key={item.id}
                          item={item}
                          processing={cart.processing}
                          handleShowUndo={handleShowUndo}
                          showMask
                          hadInitMulberry={hadInitMulberry}
                        />
                      )
                    )}
                  </>
                ) : (
                  <div className={`${style.items}__empty`}>
                    <p>You have no items in your shopping cart.</p>
                  </div>
                )}
              </div>
              {loading && (
                <div className={`${style.cart}__loading`}>
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          <div className={style.summary}>
            <div className={`${style.summary}__title`}>Cart summary</div>
            {config.enableNewPromotion ? (
              <OrderSummaryV2 className={`${style.summary}__main`} />
            ) : (
              <OrderSummary className={`${style.summary}__main`} />
            )}
            <div className={`${style.summary}__btn`}>
              {config.enableNewPromotion ? <CheckoutBtnV2 /> : <CheckoutBtn />}
            </div>
          </div>
        </div>
      </Container>
      <CartRecommendation cartType="fullPage" />
    </div>
  );
};

Cart.propTypes = {
  location: PropTypes.object,
};

Cart.contextTypes = {
  router: PropTypes.object,
  frame: PropTypes.object,
};

export default asyncLoad([({ store: { dispatch } }) => dispatch(loadCart())])(
  wrapPage({ border: true, hideBreadcrumbs: true })(Cart)
);
