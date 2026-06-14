import React, { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import lang from 'utils/lang';
import classNames from 'classnames';
import { getUrl } from 'pages';
import modalState from 'containers/Frame/modalState';
import { ChevronUp } from '@castlery/fortress/Icons';
import { Box, Stack, Typography } from '@castlery/fortress';
import config from 'config';
import CouponV2 from './CouponV2';
import ShippingFee from './ShippingFee';

import style from './style.scss';

const OrderSummary = ({ className, fromCheckout, expandable, fromCartHeader, showMask, defaultExpand }, { router }) => {
  const { data: order, loading } = useSelector((state) => state.cart);
  const [isExpand, setIsExpand] = useState(defaultExpand || !expandable);
  const hideChangeBtn =
    (fromCheckout && router.location.pathname !== getUrl('checkout-shipping-address')) ||
    !config.enabledShowEstimateShipping ||
    loading;
  const showEstimateShipping = useMemo(() => {
    const isMiniCart = modalState?.states && modalState?.states.includes('cart');
    const isCart = isMiniCart || router?.location?.pathname === getUrl('cart');
    const isShippingAddress = router?.location?.pathname === getUrl('checkout-shipping-address');
    return (isCart || isShippingAddress) && config.enabledShowEstimateShipping;
  }, [router?.location?.pathname]);
  const [errorMsg, setErrorMsg] = useState('');

  const [openPromotionDetails, setOpenPromotionDetails] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const promotionContentRef = useRef(null);

  const showPromotions = () => {
    setOpenPromotionDetails(!openPromotionDetails);
  };

  const handleExpand = () => {
    setIsExpand(!isExpand);
  };

  let itemTotal;
  let promoTotal;
  let shipmentTotal;
  let shipmentOriginal;
  let total;
  let additionalTaxTotal;
  let serviceOriginal;
  let servicePromo;
  let serviceTotal;
  const items = order && [...order.line_items, ...order.addon_service_line_items];
  const hasItems = !!(order && items.length > 0);
  const displayPromo = (order?.promotions || []).filter(
    (p) =>
      p &&
      p.adjustable_type &&
      p.adjustable_type !== 'shipment' &&
      p.adjustable_type !== 'shipment_service_fee' &&
      p.adjustable_type !== 'manual_discount_total'
  );

  useEffect(() => {
    if (promotionContentRef.current) {
      setContentHeight(promotionContentRef.current.scrollHeight);
    }
  }, [displayPromo]);
  if (order) {
    const manualDiscountTotal = items.reduce(
      (result, item) => result + Math.abs(Number(item.manual_discount_total || 0)),
      0
    );
    const coupon = order.coupon ? Math.abs(Number(order.coupon.amount)) : 0;

    // 订单总价需要减掉所有 gift 的价格
    const giftTotal = order.line_items
      .filter((item) => !!item.gift_id)
      .reduce((result, item) => result + (Number(item.amount) || 0), 0);

    // promotion 总价需要减掉 gift 的价格
    const promotionGiftTotal = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'gift')
      .reduce((result, promotion) => result + Math.abs(Number(promotion.amount)), 0);

    itemTotal = +order.item_total + manualDiscountTotal - giftTotal;
    additionalTaxTotal = +order.additional_tax_total;

    promoTotal =
      Math.abs(Number((order.adjustment_total - additionalTaxTotal).toFixed(2))) -
      coupon -
      manualDiscountTotal -
      promotionGiftTotal;
    // - giftTotal;
    servicePromo = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'shipment_service_fee')
      .reduce((acc, promotion) => acc + Math.abs(Number(promotion.amount)), 0);
    serviceOriginal = order.shipments && order.shipments.reduce((acc, shipment) => acc + +shipment.service_fee || 0, 0);
    serviceTotal = serviceOriginal - servicePromo;

    promoTotal -= servicePromo;

    const shipmentPromo = order.promotions.filter((p) => p.adjustable_type === 'shipment');
    if (shipmentPromo.length > 0) {
      const shipmentPromoAmount = shipmentPromo.reduce((acc, promotion) => acc + Math.abs(Number(promotion.amount)), 0);
      console.log('shipmentPromoAmount', shipmentPromoAmount);
      promoTotal -= shipmentPromoAmount;
      shipmentOriginal = +order.shipment_total - serviceOriginal;
      shipmentTotal = +order.shipment_total - shipmentPromoAmount - serviceOriginal;
    } else {
      shipmentOriginal = +order.shipment_total - serviceOriginal;
      shipmentTotal = shipmentOriginal;
    }

    total = +order.total;
  } else {
    itemTotal = 0;
    shipmentOriginal = 0;
    shipmentTotal = 0;
    total = 0;
  }

  const isServiceOrder = order && order.create_type === 'schedule_delivery';

  return (
    <div className={classNames(style.orderSummary, className)} id="CartSummary">
      {isExpand && (
        <>
          {!isServiceOrder && (
            <div className={`${style.row}__wrapper`}>
              <div className={style.row} data-selenium="cart-item-total">
                <label>Items Subtotal</label>
                <span data-selenium="order-item-total">{toPrice(itemTotal, hasItems)}</span>
              </div>
            </div>
          )}

          {order?.warranty_total > 0 && (
            <div className={`${style.row}__wrapper`}>
              <div className={style.row} data-selenium="warranty-total">
                <label>Warranty Subtotal</label>
                <span data-selenium="order-item-total">{toPrice(order.warranty_total)}</span>
              </div>
            </div>
          )}

          {!isServiceOrder && order && (
            <div className={`${style.row}__wrapper`}>
              <ShippingFee
                shipmentTotal={shipmentTotal}
                shipmentOriginal={shipmentOriginal}
                hideChangeBtn={hideChangeBtn}
                showMask={showMask}
                showEstimateShipping={showEstimateShipping}
              />
            </div>
          )}
          {!!serviceOriginal && (
            <div className={`${style.row}__wrapper`}>
              <div className={style.row}>
                <label>Services</label>
                {serviceOriginal === serviceTotal ? (
                  <span data-selenium="order-services-total">{toPrice(serviceOriginal)}</span>
                ) : (
                  <div className={style.shippingCap}>
                    <span data-selenium="order-services-original">{toPrice(serviceOriginal)}</span>
                    <span data-selenium="order-services-total">{toPrice(serviceTotal, true)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {order && promoTotal !== 0 && (
            <div className={`${style.row}__wrapper`}>
              <div className={classNames(style.row)} onClick={showPromotions}>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  Promotion
                  <button type="button" className={`${style.viewPromotion}`}>
                    View more details
                  </button>
                  <ChevronUp
                    sx={{
                      cursor: 'pointer',
                      transform: `rotate(${openPromotionDetails ? 0 : 180}deg)`,
                      transition: 'transform 0.5s ease',
                      fill: '#D25C1B',
                      top: '1px',
                    }}
                  />
                </div>

                <span data-selenium="order-promo-total">-{toPrice(promoTotal)}</span>
              </div>
              {displayPromo?.length > 0 && (
                <Box
                  className="promotion-details-box"
                  ref={promotionContentRef}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    marginBottom: openPromotionDetails ? '16px' : '0',
                    maxHeight: openPromotionDetails ? `${contentHeight + 20}px` : '0px',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {displayPromo.map((promotion) => (
                    <Box key={promotion?.name + promotion?.adjustable_type + promotion?.amount}>
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography level="caption1" sx={{ fontFamily: 'Aime' }}>
                          {promotion.name}
                        </Typography>
                        <Typography
                          level="caption1"
                          sx={{
                            minWidth: 60,
                            flex: 'none',
                            textAlign: 'right',
                            // fontFamily: 'Aime',
                          }}
                        >
                          {promotion.adjustable_type === 'gift' ? 'Free Gift' : `${toPrice(promotion.amount)}`}
                        </Typography>
                      </Stack>
                      {promotion.description && (
                        <Typography level="caption2" sx={{ color: '#767676' }}>
                          {promotion.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </div>
          )}
          {/* Hint msg for order */}
          {order &&
            order.warning_messages &&
            order.warning_messages.length > 0 &&
            order.warning_messages.map((w, index) => (
              <div className={`${style.row}__wrapper ${style.row}__wrapper--warning`} key={index}>
                <div className={style.warning}>{w}</div>
              </div>
            ))}
          {/* <div className={`${style.row}__wrapper ${style.row}__wrapper--warning`} key={32323}>
            <div className={style.warning}>test</div>
          </div> */}
          {!isServiceOrder && (
            <div className={`${style.row}__wrapper`}>
              <CouponV2
                fromCheckout={fromCheckout}
                fromCartHeader={fromCartHeader}
                className={style.coupon}
                setErrorMsg={setErrorMsg}
              />
            </div>
          )}
          {errorMsg && (
            <Typography
              level="caption1"
              sx={{
                color: '#CC0025',
                marginBottom: '16px',
              }}
            >
              {errorMsg}
            </Typography>
          )}

          {/* Hint msg for coupon */}
          {order && order.auto_apply_voucher_message && (
            <div className={`${style.row}__wrapper ${style.row}__wrapper--success`}>
              <div className={style.success}>{order.auto_apply_voucher_message}</div>
            </div>
          )}
          {config.showSalesTax && order && !!additionalTaxTotal && (
            <div className={`${style.row}__wrapper`}>
              <div className={style.row}>
                <label>Sales Tax</label>
                <span data-selenium="order-tax-total">{toPrice(additionalTaxTotal)}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className={`${style.row}__wrapper`}>
        <div className={`${style.row} ${style.row}__total`}>
          <label>
            Total&nbsp;
            {config.showTaxPolicy && order?.line_items?.length > 0 && <span>{`(${lang.t('common.tax_policy')})`}</span>}
            {expandable && (
              <span
                role="button"
                className={classNames(`${style.row}__total__expand`, {
                  'is-expand': isExpand,
                })}
                onClick={handleExpand}
              >
                <ReactSVG name="arrow-down" />
              </span>
            )}
          </label>
          <span data-selenium="order-total">{toPrice(total, hasItems)}</span>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  className: PropTypes.string,
  fromCheckout: PropTypes.bool,
  expandable: PropTypes.bool,
  fromCartHeader: PropTypes.bool,
  showMask: PropTypes.bool,
  defaultExpand: PropTypes.bool,
};
OrderSummary.contextTypes = {
  router: PropTypes.object,
};

export default OrderSummary;
