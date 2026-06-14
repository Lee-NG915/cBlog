import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { Link } from 'react-router';
// import { isOutdated } from 'utils/time';
import { loadGifts } from 'redux/modules/cart';
import useCartMassagings from './hooks/useCartMassagings';
import style from './style.scss';
import MultipleTierBar from './MultipleBar';
import { storeWideCampaigns, freeShippingData, giftPromotionsData, formatBars } from './utils/promotion';

const PromotionHint = ({ cart, loadGiftPromotions, variation }, { frame, router }) => {
  const priceBreakCampaigns = useCartMassagings();
  const showWithNoFreeShipping = variation === 'C';

  useEffect(() => {
    if (cart.data.number) {
      loadGiftPromotions({ orderNumber: cart.data.number });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.data]);

  const order = cart.data || {};
  const shippingFee = +order.shipment_total;
  const itemTotal = +order.item_total;
  const isSingleShipment = order.shipments?.length === 1;
  const giftPromotions = cart.giftPromotions || [];
  // ========================= The hardcode logic is invalid ============================
  // const bundleUpItems = order.line_items.filter((lineItem) => lineItem.pair_up_info);
  // const bundleUpItemsQuantity = bundleUpItems.reduce((acc, item) => acc + item.quantity, 0);
  // const isBundleUpActive = !isOutdated('2021-04-06 00:00', '2021-05-10 00:00') && bundleUpItemsQuantity < 3;
  // const bundleUpFirstVoucher = config.bundleUpFirstVoucher;
  // const bundleUpSecondVoucher = config.bundleUpSecondVoucher;
  // const bundleUpHintEle = null;
  // ========================= The hardcode logic is invalid ============================
  const chosenGift = order.line_items.find((lineItem) => lineItem.is_gift);

  const shipThreshold = order.shipments[0]?.free_shipping_threshold;
  const FREE_SHIPPING_LIMIT =
    !shipThreshold || Number.isNaN(shipThreshold) ? (__COUNTRY__ === 'SG' ? 300 : Infinity) : Number(shipThreshold);

  const barSteps = React.useMemo(() => {
    let multipleTierBars = [
      ...storeWideCampaigns(priceBreakCampaigns, itemTotal),
      ...giftPromotionsData(giftPromotions, chosenGift, itemTotal),
    ];
    if (!showWithNoFreeShipping && Number.isFinite(FREE_SHIPPING_LIMIT)) {
      // shippingTotal为0时，认为已经满足free shipping条件
      const total = shippingFee <= 0 ? FREE_SHIPPING_LIMIT : itemTotal;
      // SG - single or multiple shipment - no matter how many shipments, will be FREE shipping once total order amount >300.
      if (__COUNTRY__ === 'SG' || isSingleShipment) {
        multipleTierBars = [...multipleTierBars, ...freeShippingData(FREE_SHIPPING_LIMIT, total)];
      }
    }

    return formatBars(multipleTierBars);
  }, [
    priceBreakCampaigns,
    giftPromotions,
    chosenGift,
    itemTotal,
    shippingFee,
    isSingleShipment,
    FREE_SHIPPING_LIMIT,
    showWithNoFreeShipping,
  ]);
  // ========================= The hardcode logic is invalid ============================
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
  // ========================= The hardcode logic is invalid ============================

  return (
    <div className={style.promotionHint}>
      <MultipleTierBar steps={barSteps} value={itemTotal} variation={variation} />
      {/* {bundleUpHintEle} */}
    </div>
  );
};

PromotionHint.propTypes = {
  cart: PropTypes.object,
  loadGiftPromotions: PropTypes.func,
  variation: PropTypes.string,
};

PromotionHint.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

PromotionHint.propTypes = {
  cart: PropTypes.object,
};

const PromotionHintWrapper = (props) => {
  if (props.cart && props.cart.data) {
    return <PromotionHint {...props} />;
  }
  return null;
};
export default connect(
  (state) => ({
    cart: state.cart,
  }),
  (dispatch) => ({
    loadGiftPromotions: (payload) => dispatch(loadGifts(payload)),
  })
)(PromotionHintWrapper);
