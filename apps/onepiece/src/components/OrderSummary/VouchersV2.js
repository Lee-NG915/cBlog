// cart 页面 的 coupon 下拉框 中的coupon
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { load as loadCouponsV2 } from 'redux/modules/couponsV2';
import { useSelector, useDispatch } from 'react-redux';
import { toPrice } from 'utils/number';
import { formatDate, getDate } from 'utils/time';
import ReactSVG from 'components/ReactSVG';
import TooltipEllipsis from 'components/NewTooltip/TooltipEllipsis';
import Tooltip from 'components/NewTooltip';
import classNames from 'classnames';
import debounce from 'utils/debounce';
import Spinner from 'components/Spinner';
import { redeemYotpoPoints, getYotpoRedemptionOptions } from 'utils/yotpo';
import { loadYotpoDetails } from 'redux/modules/yotpo';
import style from './style.scss';

const VouchersV2 = (
  { inputVal, applyCoupon, closeDropdown, couponRef, changeRedeemStatus, handleVisibility },
  { frame }
) => {
  const cart = useSelector((state) => state.cart);
  const couponsV2 = useSelector((state) => state.couponsV2);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { loading, data: vouchers = [] } = couponsV2;
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

  const baseVouchers = vouchers.reduce((acc, item) => {
    // 0: available, 1: unavailable, 2: expired, 3: used
    const { code, voucherType, voucherTime, content, state } = item;

    // 排除 state = 1 的数据
    if (state === 2) {
      return acc;
    }

    let highlightedTitle = '';
    let highlightedCode = code;

    // 如果有输入值，进行过滤和高亮处理
    if (inputVal) {
      if (
        code.toLowerCase()?.includes(inputVal.toLowerCase()) ||
        content.discountDescription.toLowerCase()?.includes(inputVal.toLowerCase())
      ) {
        highlightedCode = highlight(code, inputVal);
        highlightedTitle = highlight(content.discountDescription, inputVal);
      } else {
        return acc; // 只有在有输入值且不匹配时才跳过
      }
    }

    acc.push({
      ...item,
      id: code,
      type: 'coupon',
      title: content.discountDescription,
      available: state === 0,
      expired_at: voucherTime.endTime * 1000,
      unavailable_reason: content.unavailableReason,
      description: content.discountDescription,
      usingRuleDescription: content.usingRuleDescription,
      upgradeDescription: content.upgradeDescription,
      usingRuleDetail: content.usingRuleDetail,
      highlightedCode,
      highlightedTitle,
    });

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

  const handleApplyCoupon = (data) => {
    setIsRedeeming(true);
    applyCoupon(data).finally(() => {
      setIsRedeeming(false);
    });
  };

  const handleRedeem = debounce((id) => {
    setIsRedeeming(true);
    changeRedeemStatus(true);
    redeemYotpoPoints(user, id)
      .then((res) => {
        refreshPoints(user);
        // dispatch(loadCoupons(order.number, false))
        dispatch(loadCouponsV2(order.number))
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
        const ineligible = v.type !== 'credits' && !v.available;
        return (
          <div key={v.id}>
            {v.type === 'notice' ? (
              <div className={`${style.dropdown}__notice`}>
                You have&nbsp;<span>{v.points} credits</span>! Redeem.
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
                    const { code, voucherType } = v;
                    handleApplyCoupon({ code, voucherType });
                  }
                }}
              >
                <div className={`${style.dropdown}__box`}>
                  <div className={`${style.dropdown}__luster`} />
                  <div className={`${style.dropdown}__title`}>
                    <TooltipEllipsis title={v.title} hideIcon>
                      {v.highlightedTitle ? (
                        <span
                          className={`${style.dropdown}__title__text`}
                          dangerouslySetInnerHTML={{ __html: v.highlightedTitle }}
                        />
                      ) : (
                        <span className={`${style.dropdown}__title__text`}>{v.title}</span>
                      )}
                    </TooltipEllipsis>

                    {v.upgradeDescription && (
                      <div className={`${style.dropdown}__title__tips`}>
                        <span>Upgrade</span>
                      </div>
                    )}
                    {v.type === 'credits' && !v.description && v.min_spend > 0 && (
                      <div className={`${style.dropdown}__title__min`}>Min. spend {toPrice(v.min_spend)}</div>
                    )}
                    {v.type === 'coupon' && (
                      <>
                        {v.upgradeDescription ? (
                          <Tooltip
                            title={
                              v.upgradeDescription.includes('\n')
                                ? v.upgradeDescription.split('\n')
                                : v.upgradeDescription
                            }
                            className={style.tooltip}
                          >
                            <ReactSVG name="normal-info" />
                          </Tooltip>
                        ) : (
                          <div className={`${style.dropdown}__title__min`}>{v.usingRuleDescription}</div>
                        )}
                      </>
                    )}
                  </div>

                  <div className={`${style.dropdown}__content__date ${style.dropdown}__date`}>
                    Valid Till: {v.expired_at ? formatDate(getDate(v.expired_at)) : 'Forever'}
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
                              'is-unavailable': !v.available,
                            })}
                            dangerouslySetInnerHTML={{ __html: v.highlightedCode }}
                          />
                        ) : (
                          <span
                            className={classNames(`${style.dropdown}__code__title`, {
                              'is-unavailable': !v.available,
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
                          title={
                            v.unavailable_reason.includes('\n')
                              ? v.unavailable_reason.split('\n')
                              : v.unavailable_reason
                          }
                          className={style.tooltip}
                        >
                          <ReactSVG style={{ marginLeft: '4px' }} name="normal-info" />
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

VouchersV2.propTypes = {
  inputVal: PropTypes.string,
  applyCoupon: PropTypes.func,
  closeDropdown: PropTypes.func,
  couponRef: PropTypes.object,
  changeRedeemStatus: PropTypes.func,
  handleVisibility: PropTypes.func,
};
VouchersV2.contextTypes = {
  frame: PropTypes.object,
};

export default VouchersV2;
