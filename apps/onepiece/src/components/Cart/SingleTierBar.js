import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import { isOutdated } from 'utils/time';
import SvgIcon from 'components/SvgIcon';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { loadGifts } from 'redux/modules/cart';
import {
  EVENT_GWP_BANNER_CLICK,
  EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
  EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION,
} from 'utils/track/constants';
import config from 'config';
import useCartMassagings from './hooks/useCartMassagings';
import { get } from '../../helpers/Cookie';
import GiftModal from './GiftModal';
import style from './style.scss';

const PromotionHint = ({ cart, showPriceBreakCampaignLabel, loadGiftPromotions }, { frame }) => {
  const { desktop } = useBreakpoints();
  const dispatch = useDispatch();

  useEffect(() => {
    if (cart.data.number) {
      loadGiftPromotions({ orderNumber: cart.data.number });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.data]);

  const openFreeGiftModal = useCallback(() => {
    frame?.addModal(<GiftModal />);
    dispatch({
      type: EVENT_GWP_BANNER_CLICK,
      // result: { position },
    });
  }, [frame]);

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
      const { item_total: itemTotal } = cart.data;
      if (itemTotal < maxLimit) {
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

  const priceBreakCampaigns = useCartMassagings();

  const order = cart.data || {};
  // const shippingFee = +order.shipment_total;
  // const total = +order.total - shippingFee;
  const itemTotal = +order.item_total;
  const isSingleShipment = order.shipments?.length === 1;
  // +order.estimated_shipment_total.actual_amount + (+order.estimated_shipment_total.promotion_amount || 0);
  let FREE_SHIPPING_LIMIT = Infinity;
  let showFreeShippingHint = false;
  let freeShippingComplete = false;
  if (isSingleShipment || config.enabledHardcodeFreeShipping) {
    // ABTest is opened and the free shipping bar is displayed according to the new rules.
    const shipThreshold = order.shipments[0]?.free_shipping_threshold;
    FREE_SHIPPING_LIMIT =
      !shipThreshold || Number.isNaN(shipThreshold)
        ? config.enabledHardcodeFreeShipping
          ? config.sgFreeShippingThreshold
          : Infinity
        : Number(shipThreshold);
    showFreeShippingHint = Number.isFinite(FREE_SHIPPING_LIMIT);
    freeShippingComplete = itemTotal >= FREE_SHIPPING_LIMIT;
  }

  const insiderIndex = get('castlery_insider'); // judge cookie for test

  let priceBreakCampaign;
  if (['0', '1', '2', '3'].includes(insiderIndex)) {
    priceBreakCampaign = priceBreakCampaigns[parseInt(insiderIndex)];
  } else {
    priceBreakCampaign = priceBreakCampaigns.find((campaign) => !isOutdated(campaign.startDate, campaign.endDate));
  }
  let currentPriceBreakCampaign;
  if (priceBreakCampaign) {
    if (priceBreakCampaign.discountStrategy) {
      currentPriceBreakCampaign = calcDiscount(priceBreakCampaign.discountStrategy);
    } else {
      currentPriceBreakCampaign = priceBreakCampaign.discounts.find((discount) => itemTotal < discount.limit);
    }
  }
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
  }, [priceBreakCampaign, currentPriceBreakCampaign, showFreeShippingHint]);

  const giftPromotions = cart.giftPromotions || [];
  const isFreeGiftValid = giftPromotions.length > 0;
  // ========================= The hardcode logic is invalid ============================
  // const bundleUpItems = order.line_items.filter((lineItem) => lineItem.pair_up_info);
  // const bundleUpItemsQuantity = bundleUpItems.reduce((acc, item) => acc + item.quantity, 0);
  // const isBundleUpActive = !isOutdated('2021-04-06 00:00', '2021-05-10 00:00') && bundleUpItemsQuantity < 3;
  // const bundleUpFirstVoucher = __COUNTRY__ === 'AU' ? 15 : 5;
  // const bundleUpSecondVoucher = __COUNTRY__ === 'AU' ? 20 : 10;
  // ========================= The hardcode logic is invalid ============================
  // 免邮进度条的优先级：
  // 不满足免邮条件时，优先显示免邮进度条
  // 满足免邮条件时，判断是否有全店活动/gift promotion，有的话，优先显示全店活动
  if (showFreeShippingHint && freeShippingComplete && (currentPriceBreakCampaign || isFreeGiftValid)) {
    showFreeShippingHint = false;
  }

  let promotionHintEle = null;
  const bundleUpHintEle = null;
  let giftBannerEle = null;

  let validGiftPromotion;
  if (isFreeGiftValid) {
    validGiftPromotion = giftPromotions.find((promotion) => promotion.is_eligible);
  }
  const chosenGift = order.line_items.find((lineItem) => lineItem.is_gift);

  const helperLinkTrigger = useCallback((priceBreakCampaign, currentPriceBreakCampaign) => {
    if (!priceBreakCampaign.link) return false;
    dispatch({
      type: EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
      result: {
        campaignName: priceBreakCampaign.campaignName,
        discount: currentPriceBreakCampaign.label,
      },
    });
  }, []);

  if (validGiftPromotion && !chosenGift) {
    const giftEle = (
      <div className={style.promotionHint}>
        <div role="button" className={`${style.promotionHint}__promo`} onClick={openFreeGiftModal}>
          <div className={`${style.promotionHint}__promo-label`}>
            <strong>Free Gift Unlocked!</strong> {' Choose Gift >'}
          </div>
          <div className={`${style.promotionHint}__promo-badge`}>FREE!</div>
        </div>
      </div>
    );
    if (showFreeShippingHint) {
      if (freeShippingComplete) {
        giftBannerEle = giftEle;
      }
    } else {
      giftBannerEle = giftEle;
    }
  }

  // if (isBundleUpActive) {
  //   bundleUpHintEle = (
  //     <div className={`${style.promotionHint}__promo`}>
  //       <Link to="/bundle-and-save" onClick={frame?.removeAllModals}>
  //         Bundle Sale: Add {bundleUpItemsQuantity === 0 ? 2 : 1} of{' '}
  //         <span className={`${style.promotionHint}__link`}>these items</span> to get{' '}
  //         <strong>{bundleUpItemsQuantity === 2 ? bundleUpSecondVoucher : bundleUpFirstVoucher}% off</strong>.
  //       </Link>
  //     </div>
  //   );
  // }

  if (showFreeShippingHint) {
    // Free shipping hint
    promotionHintEle = (
      <div className={style.promotionHint}>
        <p className={`${style.promotionHint}__desc`}>
          {freeShippingComplete ? (
            <>Congrats, you can now enjoy Free Shipping!</>
          ) : (
            <>You are {toPrice(FREE_SHIPPING_LIMIT - itemTotal)}away from Free Shipping!</>
          )}
        </p>

        <div className={`${style.promotionHint}__bar`}>
          <span style={{ width: freeShippingComplete ? '100%' : `${(itemTotal / FREE_SHIPPING_LIMIT) * 100}%` }} />
          <div className={`${style.promotionHint}__badge`}>
            <ReactSVG name="check-circle" />
            <span>FREE!</span>
          </div>
        </div>
      </div>
    );
  } else if (priceBreakCampaign) {
    promotionHintEle = (
      <>
        {currentPriceBreakCampaign && (
          <div className={style.promotionHint}>
            <p className={`${style.promotionHint}__desc`}>
              <Link
                href={`${__BASE_URL__}${priceBreakCampaign.link}`}
                onClick={() => helperLinkTrigger(priceBreakCampaign, currentPriceBreakCampaign)}
                className={classNames({ [`${style.promotionHint}__desc__emptylink`]: !priceBreakCampaign.link })}
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
            <div className={`${style.promotionHint}__bar`}>
              <span
                style={{
                  width: `${(itemTotal / currentPriceBreakCampaign.limit) * 100}%`,
                }}
              />
              <div
                className={`${style.promotionHint}__badge ${
                  currentPriceBreakCampaign.mode === 'long' ? `${style.promotionHint}__badge--long` : ''
                }`}
              >
                <ReactSVG name={currentPriceBreakCampaign.icon} />
                {showPriceBreakCampaignLabel && <span>{currentPriceBreakCampaign.label}</span>}
              </div>
            </div>
          </div>
        )}
      </>
    );
  } else if (isFreeGiftValid) {
    const isEligible = giftPromotions.find((promotion) => promotion.is_eligible);
    const FREE_GIFT_LIMIT = +giftPromotions[0]?.min_spend;

    if (!isEligible && FREE_GIFT_LIMIT - itemTotal > 0) {
      promotionHintEle = (
        <div className={style.promotionHint}>
          <p>
            {desktop ? 'Only ' : ''}
            <strong>{toPrice(FREE_GIFT_LIMIT - itemTotal)}</strong> more to <strong>unlock Free Gift</strong>.{' '}
            <a role="button" onClick={openFreeGiftModal} className={`${style.promotionHint}__trigger`}>
              {'Learn More >'}
            </a>
          </p>
          <div className={`${style.promotionHint}__bar`}>
            <span style={{ width: `${(itemTotal / FREE_GIFT_LIMIT) * 100}%` }} />
            <div className={`${style.promotionHint}__badge`}>
              <SvgIcon name="gift" />
              <span>FREE!</span>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {giftBannerEle}
      {promotionHintEle}
      {bundleUpHintEle}
    </>
  );
};

PromotionHint.propTypes = {
  cart: PropTypes.object,
  showPriceBreakCampaignLabel: PropTypes.bool,
  loadGiftPromotions: PropTypes.func,
};

PromotionHint.contextTypes = {
  frame: PropTypes.object,
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
    loadGiftPromotions: (payload) => dispatch(loadGifts(payload)),
  })
)(PromotionHintWrapper);
