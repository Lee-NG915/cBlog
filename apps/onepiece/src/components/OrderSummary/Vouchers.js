import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { load as loadCoupons } from 'redux/modules/coupons';
import { useSelector, useDispatch } from 'react-redux';
import { toPrice } from 'utils/number';
import dayjs from 'dayjs';
import { formatDate, getDate } from 'utils/time';
import ReactSVG from 'components/ReactSVG';
import TooltipEllipsis from 'components/NewTooltip/TooltipEllipsis';
import Tooltip from 'components/NewTooltip';
import classNames from 'classnames';
import { formatPreferences } from 'containers/Account/config';
import debounce from 'utils/debounce';
import Spinner from 'components/Spinner';
import { redeemYotpoPoints, getYotpoRedemptionOptions } from 'utils/yotpo';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import style from './style.scss';

const Vouchers = (
  { inputVal, applyCoupon, closeDropdown, couponRef, changeRedeemStatus, handleVisibility },
  { frame }
) => {
  const cart = useSelector((state) => state.cart);
  const coupons = useSelector((state) => state.coupons);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { loading, data: vouchers = [] } = coupons;
  const [isRedeeming, setIsRedeeming] = useState(false);
  const vouchersRef = useRef();
  const order = cart.data;
  const isLoading = loading || isRedeeming || cart.loading || cart.creating || cart.processing;
  const points = useSelector((state) => state.yotpo.customerYotpoPoints);
  const [redemptions, setRedemptions] = useState([]);
  const [loadingYotpo, setLoadingYotpo] = useState(false);

  const highlight = useCallback((data, query) => {
    const reg = new RegExp(query, 'ig');
    if (data) {
      return data.replace(reg, (match) => `<strong>${match}</strong>`);
    }
    return null;
  }, []);

  const baseVouchers = vouchers.reduce((acc, cur) => {
    const { calculators } = cur;
    if (calculators?.length > 0) {
      const newCal = calculators.map((item) => {
        const { type, preferences } = item || {};
        const { title, description, descriptionInfo, isHighest } = formatPreferences(type, preferences, 'cart');
        return {
          ...item,
          title,
          description,
          descriptionInfo,
          isHighest,
        };
      });

      let code = cur.code;
      const title = newCal.map((item) => item.title)?.join(' & ');
      let highlightedTitle = '';
      if (inputVal) {
        if (!code.toLowerCase()?.includes(inputVal) && !title.toLowerCase()?.includes(inputVal)) {
          return acc;
        }
        code = highlight(cur.code, inputVal);
        highlightedTitle = highlight(title, inputVal);
      }

      acc.push({
        ...cur,
        highlightedCode: code,
        calculators: newCal,
        title,
        highlightedTitle,
        description: newCal.length > 1 ? '' : newCal[0]?.description,
        descriptionInfo: newCal.length > 1 ? title : newCal[0]?.descriptionInfo,
        isHighest: newCal.length === 1 && newCal[0]?.isHighest,
      });
    } else {
      acc.push(cur);
    }

    return acc;
  }, []);

  const formatVoucher = useMemo(
    () => baseVouchers.concat([{ id: 'notice', type: 'notice', points }], redemptions),
    [baseVouchers, redemptions, points]
  );

  const refreshPoints = useCallback(
    (user) => {
      if (user) {
        dispatch(loadYotpoDetails());
      }
    },
    [dispatch]
  );

  const getRedemptionOptions = useCallback(
    async (user) => {
      if (points < 50) {
        return [];
      }
      setLoadingYotpo(true);
      const timerId = setTimeout(() => {
        setLoadingYotpo(false);
        clearTimeout(timerId);
      }, 5000);
      // https://loyaltyapi.yotpo.com/reference/get-redemption-option-data
      const options = await getYotpoRedemptionOptions(user);
      setLoadingYotpo(false);
      return Array.isArray(options)
        ? options
            .filter((item) => item.amount <= points)
            .map((item) => ({
              id: item.id,
              type: 'credits',
              title: item.name,
              cost: item.amount, // The number of points required to redeem this option
              min_spend: item.description?.split('Min. spend $')?.[1],
              expired_at: getDate().add(31, 'day'),
            }))
        : [];
    },
    [setLoadingYotpo, points]
  );
  useEffect(() => {
    if (user) {
      dispatch(loadYotpoDetails());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      const loadYotpoData = async (user) => {
        setLoadingYotpo(true);
        await dispatch(loadYotpoDetails());
        if (__CLIENT__ && __YOTPO_ENABLED__) {
          const options = await getRedemptionOptions(user);
          setLoadingYotpo(false);
          setRedemptions(options);
        } else {
          setLoadingYotpo(false);
        }
      };
      loadYotpoData(user);
    }
  }, [user, setLoadingYotpo, dispatch, setRedemptions, getRedemptionOptions]);

  const handleApplyCoupon = (code) => {
    setIsRedeeming(true);
    applyCoupon(code).finally(() => {
      setIsRedeeming(false);
    });
  };

  const handleRedeem = debounce((id) => {
    setIsRedeeming(true);
    changeRedeemStatus(true);
    redeemYotpoPoints(user, id)
      .then((res) => {
        refreshPoints(user);
        dispatch(loadCoupons(order.number, false))
          .then(() => {
            setIsRedeeming(false);
            changeRedeemStatus(false);
          })
          .catch((err) => {
            console.error(JSON.stringify({ message: 'Vouchers error', error: err }, null, 2));
            setIsRedeeming(false);
            changeRedeemStatus(false);
          });
      })
      .catch((err) => {
        console.error(JSON.stringify({ message: 'Vouchers error', error: err }, null, 2));
        setIsRedeeming(false);
        changeRedeemStatus(false);
        frame.openModal('response');
      });
  }, 40);

  const redeemFn = (id) => {
    frame.openModal('confirmation', {
      type: 'warning',
      title: 'This redemption cannot be undone.',
      description: 'The redemption of voucher cannot be undone. Would you like to proceed?',
      onConfirm: () => handleRedeem(id),
    });
  };

  useEffect(() => {
    const clickedOutside = (e) => {
      if (
        vouchersRef.current &&
        !vouchersRef.current.contains(e.target) &&
        couponRef.current &&
        !couponRef.current.contains(e.target) &&
        closeDropdown
      ) {
        closeDropdown();
      }
    };
    window.addEventListener('click', clickedOutside);
    return () => {
      window.removeEventListener('click', clickedOutside);
    };
  }, [couponRef, closeDropdown]);

  useEffect(() => {
    handleVisibility(formatVoucher?.length === 0 ? 'hidden' : 'visible');
  }, [formatVoucher.length, handleVisibility]);

  return (
    <div className={classNames(`${style.dropdown}__main`, { 'has-mask': isLoading })} ref={vouchersRef}>
      {formatVoucher.map((v) => {
        const ineligible = !v.expired_at
          ? false
          : v.type !== 'credits' && (!dayjs().isBefore(dayjs(v.expired_at)) || !v.available);

        return (
          <div key={v.id}>
            {v.type === 'notice' ? (
              <div className={`${style.dropdown}__notice`}>
                You have&nbsp;<span>{v.points} credits</span>! Redeem now.
              </div>
            ) : (
              <div
                className={classNames(`${style.dropdown}__content`, {
                  ineligible,
                })}
                onClick={() => {
                  if (v.type === 'credits') {
                    redeemFn(v.id);
                  } else if (!ineligible) {
                    handleApplyCoupon(v.code);
                  }
                }}
              >
                <div className={`${style.dropdown}__box`}>
                  <div className={`${style.dropdown}__luster`} />
                  <div className={`${style.dropdown}__title`}>
                    <TooltipEllipsis title={v.title}>
                      {v.highlightedTitle ? (
                        <span
                          className={`${style.dropdown}__title__text`}
                          dangerouslySetInnerHTML={{ __html: v.highlightedTitle }}
                        />
                      ) : (
                        <span className={`${style.dropdown}__title__text`}>{v.title}</span>
                      )}
                    </TooltipEllipsis>

                    {v.description && !v.isHighest && (
                      <div className={`${style.dropdown}__title__tips`}>
                        <span>Upgrade</span>
                        {v.calculators?.length === 1 && (
                          <Tooltip title={v.descriptionInfo} className={style.tooltip}>
                            <ReactSVG name="normal-info" />
                          </Tooltip>
                        )}
                      </div>
                    )}

                    {!v.description && v.min_spend > 0 && (
                      <div className={`${style.dropdown}__title__min`}>Min. spend {toPrice(v.min_spend)}</div>
                    )}
                  </div>

                  <div className={`${style.dropdown}__content__date ${style.dropdown}__date`}>
                    Valid Till: {v.expired_at ? formatDate(dayjs(v.expired_at).subtract(1, 'day')) : 'Forever'}
                  </div>
                </div>

                <div className={`${style.dropdown}__box__right`}>
                  <div className={`${style.dropdown}__content__divide ${style.dropdown}__divide`} />

                  {v.type === 'credits' ? (
                    <div className={`${style.dropdown}__redeem`}>
                      <div>{v.cost} credits</div>
                      <div className={`${style.dropdown}__redeem__btn`}>Redeem</div>
                    </div>
                  ) : (
                    <div className={`${style.dropdown}__code`}>
                      <TooltipEllipsis title={v.code} placement="topRight" fitPlacement="bottomRight" hideIcon>
                        {v.highlightedCode ? (
                          <span
                            className={classNames(`${style.dropdown}__code__title`, {
                              'is-unavailable': v.unavailable_reason,
                            })}
                            dangerouslySetInnerHTML={{ __html: v.highlightedCode }}
                          />
                        ) : (
                          <span
                            className={classNames(`${style.dropdown}__code__title`, {
                              'is-unavailable': v.unavailable_reason,
                            })}
                          >
                            {v.code}
                          </span>
                        )}
                      </TooltipEllipsis>
                      {v.unavailable_reason && (
                        <Tooltip
                          placement="topRight"
                          fitPlacement="bottomRight"
                          title={v.unavailable_reason}
                          className={style.tooltip}
                        >
                          <ReactSVG name="normal-info" />
                        </Tooltip>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {(isLoading || loadingYotpo) && (
        <div className={`${style.dropdown}__mask`}>
          <Spinner type="dark" />
        </div>
      )}
    </div>
  );
};

Vouchers.propTypes = {
  inputVal: PropTypes.string,
  applyCoupon: PropTypes.func,
  closeDropdown: PropTypes.func,
  couponRef: PropTypes.object,
  changeRedeemStatus: PropTypes.func,
  handleVisibility: PropTypes.func,
};
Vouchers.contextTypes = {
  frame: PropTypes.object,
};

export default Vouchers;
