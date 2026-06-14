import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import { isOutdated } from 'utils/time';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { loadGiftsV2 } from 'redux/modules/cart';
import { EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK, EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION } from 'utils/track/constants';
import config from 'config';
import { Box, Typography } from '@castlery/fortress';
import useCartMassagings from './hooks/useCartMassagings';
import { get } from '../../helpers/Cookie';
import style from './style.scss';
import { useFreeGiftCampaign } from './hooks/useFreeGiftCampaign';
import FreeGift from './Campaign/FreeGift';

const PromotionHint = ({ cart, loadGiftPromotions, fullCart, showPriceBreakCampaignLabel }) => {
  const { desktop, mobile } = useBreakpoints();
  const dispatch = useDispatch();
  const { orderCampaignGift, allFreeGiftCampaignPromotion, validCampaignGiftPromotion } = useFreeGiftCampaign();

  const freeGiftBannerTextStatus = !orderCampaignGift && validCampaignGiftPromotion;
  // 当购物车号码存在时加载赠品促销信息
  useEffect(() => {
    if (cart.data.number) {
      loadGiftPromotions({ orderNumber: cart.data.number, params: { coupon_code: cart?.data?.coupon?.code } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.data]);

  const order = cart.data || {};
  const itemTotal = +order.item_total_exclude_gift;
  const itemCount = +order.item_count_exclude_gift;

  const calcDiscount = useCallback(
    ({ off, increment, minLimit, maxLimit }) => {
      if (
        typeof off !== 'number' ||
        off <= 0 ||
        typeof increment !== 'number' ||
        increment <= 0 ||
        minLimit > maxLimit
      ) {
        return null;
      }
      const { item_total_exclude_gift: itemTotal } = cart.data;
      // 如果未达到最大限额，计算下一个折扣档位
      if (+itemTotal < maxLimit) {
        const m = parseInt(itemTotal / increment) + 1;
        return {
          icon: 'check-circle',
          limit: m * increment,
          label: `$${off * m} off`,
        };
      }
      return null;
    },
    [cart]
  );

  // 获取价格阶梯活动配置
  const priceBreakCampaigns = useCartMassagings();

  const isSingleShipment = order.shipments?.length === 1;
  let FREE_SHIPPING_LIMIT = Infinity;
  let showFreeShippingHint = false;
  let freeShippingComplete = false;
  if (isSingleShipment || config.enabledHardcodeFreeShipping) {
    // ABTest is opened and the free shipping bar is displayed according to the new rules.
    const rawThreshold = +order.shipments[0]?.free_shipping_threshold;
    const hasApiThreshold = rawThreshold && !Number.isNaN(rawThreshold);
    if (config.enabledHardcodeFreeShipping) {
      FREE_SHIPPING_LIMIT = hasApiThreshold ? rawThreshold + 0.01 : config.sgFreeShippingThreshold;
    } else {
      FREE_SHIPPING_LIMIT = hasApiThreshold ? rawThreshold : Infinity;
    }
    showFreeShippingHint = Number.isFinite(FREE_SHIPPING_LIMIT);
    freeShippingComplete = itemTotal >= FREE_SHIPPING_LIMIT;
  }

  // A/B测试分组标识
  const insiderIndex = get('castlery_insider');

  // 确定当前适用的价格阶梯活动
  let priceBreakCampaign;
  if (['0', '1', '2', '3'].includes(insiderIndex)) {
    // A/B测试场景：根据用户分组选择对应活动
    priceBreakCampaign = priceBreakCampaigns[parseInt(insiderIndex)];
  } else {
    // 常规场景：选择当前时间段内有效的活动
    priceBreakCampaign = priceBreakCampaigns.find((campaign) => !isOutdated(campaign.startDate, campaign.endDate));
  }
  // 计算当前适用的折扣等级
  let currentPriceBreakCampaign;
  if (priceBreakCampaign) {
    if (priceBreakCampaign.discountStrategy) {
      // 动态策略：根据规则计算折扣
      currentPriceBreakCampaign = calcDiscount(priceBreakCampaign.discountStrategy);
    } else {
      // 固定策略：查找第一个未达到的折扣档位

      currentPriceBreakCampaign = priceBreakCampaign.discounts.find((discount) => itemTotal < discount.limit);
    }
  }

  // 追踪价格阶梯活动展示
  useEffect(() => {
    if (showFreeShippingHint) return false;
    if (currentPriceBreakCampaign) {
      dispatch({
        type: EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION,
        result: {
          campaignName: priceBreakCampaign.campaignName,
          discount: currentPriceBreakCampaign.label,
        },
      });
    }
  }, [priceBreakCampaign, currentPriceBreakCampaign, showFreeShippingHint, dispatch]);

  // 赠品促销相关状态
  const haveGiftPromotion = allFreeGiftCampaignPromotion.length > 0;

  // 免邮进度条的优先级：
  // 不满足免邮条件时，优先显示免邮进度条
  // 满足免邮条件时，判断是否有全店活动/gift promotion，有的话，优先显示全店活动
  if (showFreeShippingHint && freeShippingComplete && (currentPriceBreakCampaign || haveGiftPromotion)) {
    showFreeShippingHint = false;
  }

  let promotionHintEle = null;
  let giftBannerEle = null;

  const helperLinkTrigger = useCallback(
    (priceBreakCampaign, currentPriceBreakCampaign) => {
      if (!priceBreakCampaign.link) return false;
      dispatch({
        type: EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
        result: {
          campaignName: priceBreakCampaign.campaignName,
          discount: currentPriceBreakCampaign.label,
        },
      });
    },
    [dispatch]
  );

  if (!!validCampaignGiftPromotion && !orderCampaignGift) {
    const giftEle = (
      <Box sx={{ padding: !fullCart ? '0 0' : '0', '--fortress-fontFamily-body': 'Aime', color: '#3c101e' }}>
        {!currentPriceBreakCampaign && !showFreeShippingHint && (
          <>
            <Typography level="body1" sx={{ mb: 1 }}>
              Congratulations, you have unlocked a Free Gift!
            </Typography>
            <div className={`${style.promotionHintV2}__bar`} style={{ marginBottom: '16px' }}>
              <span style={{ width: `100%` }} />
              {/* <div className={`${style.promotionHint}__badge`}>
                <SvgIcon name="gift" />
                <span>FREE!</span>
              </div> */}
            </div>
          </>
        )}
        <FreeGift isFullCart={!!fullCart} />
      </Box>
    );
    giftBannerEle = giftEle;
  }

  if (showFreeShippingHint) {
    promotionHintEle = (
      <div className={style.promotionHintV2}>
        <p className={`${style.promotionHintV2}__desc`}>
          {freeGiftBannerTextStatus && <span style={{ color: '#3c101e' }}>Free gift unlocked!&nbsp;</span>}

          {freeShippingComplete ? (
            <>Congrats, you can now enjoy Free Shipping!</>
          ) : (
            <>You are {toPrice(FREE_SHIPPING_LIMIT - itemTotal)} away from Free Shipping!</>
          )}
        </p>

        <div className={`${style.promotionHintV2}__bar`}>
          <span
            style={{
              width: freeShippingComplete ? '100%' : `${(itemTotal / FREE_SHIPPING_LIMIT) * 100}%`,
            }}
          />
          <div className={`${style.promotionHintV2}__badge`}>
            <ReactSVG name="check-circle" />
            <span>FREE!</span>
          </div>
        </div>
      </div>
    );
  } else if (currentPriceBreakCampaign) {
    promotionHintEle = (
      <div className={style.promotionHintV2}>
        <p className={`${style.promotionHintV2}__desc`}>
          {freeGiftBannerTextStatus && <span style={{ color: '#3c101e' }}>Free gift unlocked!&nbsp;</span>}

          <Link
            href={`${__BASE_URL__}${priceBreakCampaign.link}`}
            onClick={() => helperLinkTrigger(priceBreakCampaign, currentPriceBreakCampaign)}
            className={classNames({
              [`${style.promotionHintV2}__desc__emptylink`]: !priceBreakCampaign.link,
            })}
          >
            <span>{priceBreakCampaign.campaignName}: </span>
            <span>
              <span>
                {toPrice(currentPriceBreakCampaign.limit - itemTotal)} more
                <strong> to get {currentPriceBreakCampaign.label}!</strong>
              </span>
            </span>
          </Link>
        </p>
        <div className={`${style.promotionHintV2}__bar`}>
          <span
            style={{
              width: `${(itemTotal / currentPriceBreakCampaign.limit) * 100}%`,
            }}
          />
          <div
            className={`${style.promotionHintV2}__badge ${
              currentPriceBreakCampaign.mode === 'long' ? `${style.promotionHintV2}__badge--long` : ''
            }`}
          >
            <ReactSVG name={currentPriceBreakCampaign.icon} />
            {showPriceBreakCampaignLabel && <span>{currentPriceBreakCampaign.label}</span>}
          </div>
        </div>
      </div>
    );
  } else if (haveGiftPromotion && !validCampaignGiftPromotion) {
    const firstGiftCampaign = allFreeGiftCampaignPromotion[0];
    const { quantity, amount, purchaseType } = firstGiftCampaign?.min_spend;
    const FREE_GIFT_LIMIT = purchaseType === 1 ? +amount?.value - itemTotal : +quantity - itemCount;

    // 计算正确的百分比：当前值 / 目标值 * 100
    const targetValue = purchaseType === 1 ? +amount?.value : +quantity;
    const currentValue = purchaseType === 1 ? itemTotal : itemCount;
    const progressPercentage = (currentValue / targetValue) * 100;

    if (FREE_GIFT_LIMIT > 0) {
      promotionHintEle = (
        <div className={style.promotionHintV2}>
          <p>
            {desktop ? 'Only ' : ''}
            <strong>{purchaseType === 1 ? toPrice(FREE_GIFT_LIMIT) : `Quantity ${FREE_GIFT_LIMIT} `}</strong> more to{' '}
            <strong>unlock Free Gift</strong>.{' '}
          </p>
          <div className={`${style.promotionHintV2}__bar`}>
            <span style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
            {/* <div className={`${style.promotionHint}__badge`}>
              <SvgIcon name="gift" />
              <span>FREE!</span>
            </div> */}
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {promotionHintEle}
      {giftBannerEle}
    </>
  );
};

PromotionHint.propTypes = {
  cart: PropTypes.object,
  showPriceBreakCampaignLabel: PropTypes.bool,
  loadGiftPromotions: PropTypes.func,
  fullCart: PropTypes.bool,
};

const PromotionHintWrapper = ({ ...props }) => {
  if (props.cart && props.cart.data) {
    return <PromotionHint {...props} />;
  }
  return null;
};
PromotionHintWrapper.propTypes = {
  cart: PropTypes.object,
};
export default connect(
  (state) => ({
    cart: state.cart,
  }),
  (dispatch) => ({
    loadGiftPromotions: (payload) => dispatch(loadGiftsV2(payload)),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  })
)(PromotionHintWrapper);
