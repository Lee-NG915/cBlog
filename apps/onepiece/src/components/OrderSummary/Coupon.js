import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { useSelector, useDispatch } from 'react-redux';
import { toPrice } from 'utils/number';
import { addCoupon, removeCoupon } from 'redux/modules/cart';
import { getUrl } from 'pages';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import Spinner from 'components/Spinner';
import { OutlineBtn } from 'components/Button';
import debounce from 'utils/debounce';
import { load as loadCoupons } from 'redux/modules/coupons';
import { Edit as EditIcon } from '@castlery/fortress/Icons';
import style from './style.scss';
import Vouchers from './Vouchers';
import { couponAutoApplyFlag } from './util';

const Coupon = ({ className, fromCheckout }, { frame, router }) => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const coupon = useSelector((state) => state.coupons);
  const points = useSelector((state) => state.yotpo.customerYotpoPoints);
  const { data: coupons = [], loading } = coupon;
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
  const isLoading = loading || cart.loading || cart.creating || cart.processing || isRedeeming;
  const availableCoupons = coupons?.filter((c) => c.available === true) || [];
  const [visibility, setVisibility] = useState('visible');
  useEffect(() => {
    if (user) {
      dispatch(loadYotpoDetails());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (order?.number && coupons.length === 0) {
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
        backToButton();

        // jump to cart to choose free gift
        if (fromCheckout && data.state === 'cart') {
          router.push(getUrl('cart'));
        }
      })
      .catch((error) => {
        frame.openModal('response', { body: error });
      });

  const handleAddCoupon = (e) => {
    e.preventDefault();
    const code = inputRef?.current?.value?.trim();

    if (!code) {
      backToButton();
    } else {
      applyCoupon(code);
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
      inputRef?.current?.focus();
    }
  }, [mode]);

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
      <Vouchers
        inputVal={inputVal}
        applyCoupon={applyCoupon}
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

  if (mode === 'input') {
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
                    fontSize="xl2"
                    sx={{
                      cursor: 'pointer',
                      ml: 0.5,
                    }}
                  />
                </button>
              )}
            </div>
          </div>

          <span data-selenium="order-coupon">{toPrice(order.coupon.amount)}</span>
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

Coupon.propTypes = {
  className: PropTypes.string,
  fromCheckout: PropTypes.bool,
};

Coupon.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default Coupon;
