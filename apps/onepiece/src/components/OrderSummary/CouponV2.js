// cart 页面 的 coupon 输入框
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { useSelector, useDispatch } from 'react-redux';
import { toPrice } from 'utils/number';
import { addCoupon, removeCoupon, loadGiftsV2 } from 'redux/modules/cart';
import { getUrl } from 'pages';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import Spinner from 'components/Spinner';
import { OutlineBtn } from 'components/Button';
import debounce from 'utils/debounce';
import { load as loadCoupons } from 'redux/modules/couponsV2';
import { Edit as EditIcon } from '@castlery/fortress/Icons';
import GiftModalV2 from 'components/Cart/GiftModalV2';
import { EVENT_GWP_BANNER_CLICK } from 'utils/track/constants';
import style from './style.scss';
import VouchersV2 from './VouchersV2';
import { couponAutoApplyFlag } from './util';

const CouponV2 = ({ className, fromCheckout, setErrorMsg }, { frame, router }) => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const couponV2 = useSelector((state) => state.couponsV2);
  const points = useSelector((state) => state.yotpo.customerYotpoPoints);
  const { data: coupons = [], loading: loadingV2 } = couponV2;
  const dispatch = useDispatch();
  const order = cart.data;
  const couponRef = useRef();
  const dropdownRef = useRef();
  const inputRef = useRef();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState();
  const [direction, setDirection] = useState();
  const [inputVal, setInputVal] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [verifyGiftCoupon, setVerifyGiftCoupon] = useState(false);
  const isLoading = loadingV2 || cart.loading || cart.creating || cart.processing || isRedeeming || verifyGiftCoupon;
  const availableCoupons = coupons?.filter((c) => c.state === 0) || [];
  const [visibility, setVisibility] = useState('visible');

  useEffect(() => {
    if (user) {
      dispatch(loadYotpoDetails());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (order?.number && coupons.length === 0) {
      // 获取coupon
      dispatch(loadCoupons(order.number)).catch((err) => {
        console.error(JSON.stringify({ message: 'Load coupons error', error: err }, null, 2));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const openInputMode = (e) => {
    e?.stopPropagation();
    if (!user) return false;
    // no coupon and no points
    if (coupons.length === 0 && points < 50) {
      setMode('input');
    } else {
      setMode('input');
      setOpen(true);
    }
  };

  const showInput = (e) => {
    e?.stopPropagation();
    if (!user) {
      setMode('input');
      return false;
    }
    if (coupons.length === 0 && points < 50) {
      setMode('input');
    } else {
      setMode('input');
      setOpen(true);
    }
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const backToButton = () => {
    setMode('button');
    closeDropdown();
    if (inputVal) {
      setInputVal('');
    }
  };

  const applyCoupon = (code) =>
    dispatch(addCoupon(code))
      .then((data) => {
        setErrorMsg(null);
        backToButton();
        if (fromCheckout && data.state === 'cart') {
          router.push(getUrl('cart'));
        }
      })
      .catch((error) => {
        console.log('error', error);
        // frame.openModal('response', { body: error });
        setErrorMsg(error?.errors?.[0]?.detail);
      });

  const openFreeGiftModal = (couponCode) => {
    if (fromCheckout) {
      frame.openModal('response', {
        body: 'Gift coupon code can only be used in the cart.',
      });
      setOpen(false);
    } else {
      frame?.addModal(<GiftModalV2 couponCode={couponCode} />);
      dispatch({
        type: EVENT_GWP_BANNER_CLICK,
      });
    }
  };

  const getCouponGift = async (couponCode) => {
    setVerifyGiftCoupon(true);
    try {
      const res = await dispatch(loadGiftsV2({ orderNumber: order.number, params: { coupon_code: couponCode } }));
      const couponGift = res?.find((item) => item.control_type === 2);
      return couponGift;
    } catch (error) {
      setErrorMsg(error?.errors?.[0]?.detail);
    } finally {
      setVerifyGiftCoupon(false);
    }
  };

  const verifyCoupon = async (data) => {
    const { code, voucherType } = data;

    if (voucherType === 'Free Gift') {
      const couponGift = await getCouponGift(code);
      if (couponGift) {
        openFreeGiftModal(code);
      }
    } else {
      applyCoupon(code);
    }
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    const code = inputRef?.current?.value?.trim();
    setOpen(false);
    if (!code) {
      backToButton();
    } else {
      getCouponGift(code).then((couponGift) => {
        const { is_eligible, unavailable_reason } = couponGift || {};
        if (couponGift) {
          if (is_eligible) {
            openFreeGiftModal(code);
          } else {
            setErrorMsg(unavailable_reason);
          }
        } else {
          verifyCoupon({ code });
        }
      });
    }
  };
  const handleRemoveCoupon = () => {
    order?.coupon?.code && user?.emailHashed && couponAutoApplyFlag.set(user.emailHashed, order.coupon.code);
    dispatch(removeCoupon())
      .then((data) => {
        dispatch(loadCoupons(order.number, false))
          .then(() => {
            if (fromCheckout && data.state === 'cart') {
              router.push(getUrl('cart'));
            }
            openInputMode();
          })
          .catch((err) => {
            console.error(JSON.stringify({ message: 'Load coupons after remove coupon error', error: err }, null, 2));
          });
      })
      .catch((error) => {
        frame.openModal('response', { body: error });
      });
  };

  const handleScroll = debounce(() => {
    const { top, bottom } = couponRef?.current?.getBoundingClientRect() || {};
    if (couponRef?.current) {
      const windowCenter = window.innerHeight / 2;
      const yCenter = (top + bottom - 62) / 2;
      const direct = yCenter > windowCenter ? 'up' : 'down';
      setDirection(direct);
    }
  }, 40);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    handleScroll();

    if (dropdownRef.current) {
      dropdownRef.current.style.maxHeight = open ? `${329}px` : `${0}px`;
      dropdownRef.current.style.border = open ? `1px solid #DBCFB5` : `none`;
      dropdownRef.current.style.filter = open ? `drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))` : `none`;
    }
  }, [open, handleScroll]);

  useEffect(() => {
    if (mode === 'input') {
      setErrorMsg(null);
      inputRef?.current?.focus();
    }
  }, [mode, setErrorMsg]);

  const changeRedeemStatus = (status) => {
    setIsRedeeming(status);
  };

  const dropdown = open && (
    <div
      ref={dropdownRef}
      className={classNames(`${style.dropdown}`, {
        'is-down': direction === 'down',
      })}
      style={{ maxHeight: '0px', border: 'none', filter: 'none', visibility }}
    >
      <VouchersV2
        inputVal={inputVal}
        applyCoupon={verifyCoupon}
        closeDropdown={backToButton}
        couponRef={couponRef}
        changeRedeemStatus={changeRedeemStatus}
        handleVisibility={(v) => setVisibility(v)}
      />
    </div>
  );

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputVal(value?.trim()?.toLowerCase());
  };

  if (mode === 'input' && !order?.coupon) {
    return (
      <div className={classNames(style.coupon, className)} ref={couponRef}>
        <div className={`${style.coupon}__wrapper`}>
          <div>
            <form onSubmit={handleAddCoupon} className={`${style.coupon}__form`}>
              <input
                onChange={handleInputChange}
                className={`${style.coupon}__input`}
                type="text"
                disabled={isLoading}
                ref={inputRef}
                name="coupon_code"
              />
            </form>
          </div>

          {isLoading ? (
            <Spinner type="dark" width={20} />
          ) : (
            <div className={`${style.coupon}__btns`}>
              <OutlineBtn
                type="button"
                size="medium"
                style={{ fontSize: '14px', marginRight: '15px', lineHeight: 0 }}
                onClick={handleAddCoupon}
                text="&nbsp;&nbsp;&nbsp;Apply&nbsp;&nbsp;&nbsp;"
                className="apply-btn"
              >
                {/* <ReactSVG name="check" /> */}
              </OutlineBtn>
              <button
                type="button"
                className="btn"
                onClick={backToButton}
                aria-label="Close coupon input"
                title="Close coupon input"
              >
                <ReactSVG name="close" />
              </button>
            </div>
          )}
        </div>

        {dropdown}
      </div>
    );
  }

  if (order?.coupon) {
    return (
      <div className={classNames(style.coupon, className)}>
        <div className={`${style.coupon}__wrapper`}>
          <div>
            <div className={`${style.coupon}__title`}>Coupon Code: </div>

            <div className={`${style.coupon}__apply`}>
              <span className={`${style.coupon}__apply__code`}>{order.coupon.code}</span>

              {isLoading ? (
                <Spinner type="dark" width={20} />
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  className={`${style.couponBtn}`}
                  onClick={handleRemoveCoupon}
                  aria-label="Remove coupon code"
                  title="Remove coupon code"
                >
                  <EditIcon
                    color="primary"
                    sx={{
                      cursor: 'pointer',
                      ml: 0.5,
                    }}
                  />
                </button>
              )}
            </div>
          </div>

          <span data-selenium="order-coupon">
            {order.coupon?.free_gift ? 'Free Gift' : toPrice(+order.coupon.amount + +order.warranty_total_discount)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(style.coupon, className, {
        'is-clickable': user,
      })}
      ref={couponRef}
      onClick={openInputMode}
    >
      <div className={`${style.coupon}__wrapper`}>
        <div>
          <div className={`${style.coupon}__title`} data-selenium="add_coupon_code">
            Add Coupon Code
          </div>

          {!user ? (
            <div className={`${style.coupon}__description`}>
              <a
                className={`${style.coupon}__login`}
                // onClick={(e) => {
                //   e.preventDefault();
                //   frame.openModal('login', { fromCart: true });
                // }}
                href={`${__BASE_URL__}/login?redirectUrl=${encodeURIComponent(`${__BASE_URL__}/cart`)}`}
              >
                Log in
              </a>
              &nbsp;to view your coupons
            </div>
          ) : isLoading ? (
            <Spinner type="dark" width={20} className={`${style.coupon}__description`} />
          ) : (
            availableCoupons?.length > 0 && (
              <div className={`${style.coupon}__description`}>
                {availableCoupons.length} voucher{availableCoupons.length > 1 && 's'} available
              </div>
            )
          )}
        </div>

        <button
          type="button"
          onClick={showInput}
          className={`${style.couponBtn} ${style.couponBtn}__add`}
          aria-label="Add coupon code"
          title="Add coupon code"
        >
          <ReactSVG name="plus" />
        </button>
      </div>

      {dropdown}
    </div>
  );
};

CouponV2.propTypes = {
  className: PropTypes.string,
  fromCheckout: PropTypes.bool,
  setErrorMsg: PropTypes.func,
};

CouponV2.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default CouponV2;
