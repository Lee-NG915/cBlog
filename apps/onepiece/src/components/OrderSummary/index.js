import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import lang from 'utils/lang';
import classNames from 'classnames';
import { getUrl } from 'pages';
import modalState from 'containers/Frame/modalState';
import config from 'config';
import Coupon from './Coupon';
import ShippingFee from './ShippingFee';
import style from './style.scss';

const OrderSummary = (
  { className, fromCheckout, expandable, fromCartHeader, showMask, defaultExpand },
  { frame, router }
) => {
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

  const showPromotions = () => {
    const { promotions } = order;

    frame.addModal(
      <div
        role="menuitem"
        className={style.modal}
        onClick={(e) => {
          if (e.target.classList.contains(style.modal)) {
            frame.removeModal();
          }
        }}
      >
        <div className={`${style.modal}__container`}>
          <h3>Promotions Applied</h3>
          {promotions
            .filter(
              (p) =>
                p.adjustable_type !== 'shipment' &&
                p.adjustable_type !== 'shipment_service_fee' &&
                p.adjustable_type !== 'manual_discount_total'
            )
            .map((p, index) => (
              <div key={index} className={`${style.modal}__row`}>
                <div>
                  <label id={p.id}>{p.name}</label>
                  <span>{toPrice(p.amount)}</span>
                </div>
                <p>{p.description}</p>
              </div>
            ))}
          <button type="button" className={`${style.modal}__close btn`} onClick={() => frame.removeModal()}>
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    );
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

  if (order) {
    const manualDiscountTotal = items.reduce((result, item) => result + +(item.manual_discount_total || ''), 0);
    const coupon = order.coupon ? +order.coupon.amount : 0;
    itemTotal = +order.item_total + manualDiscountTotal;
    additionalTaxTotal = +order.additional_tax_total;
    promoTotal = (order.adjustment_total - additionalTaxTotal).toFixed(2) - coupon - manualDiscountTotal;
    servicePromo = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'shipment_service_fee')
      .reduce((acc, promotion) => acc - promotion.amount, 0);
    serviceOriginal = order.shipments && order.shipments.reduce((acc, shipment) => acc + +shipment.service_fee || 0, 0);
    serviceTotal = serviceOriginal - servicePromo;
    promoTotal += servicePromo;

    const shipmentPromo = order.promotions.filter((p) => p.adjustable_type === 'shipment');
    if (shipmentPromo.length > 0) {
      const shipmentPromoAmount = shipmentPromo.reduce((acc, promotion) => acc + +promotion.amount, 0);
      promoTotal -= shipmentPromoAmount;
      shipmentOriginal = +order.shipment_total - serviceOriginal;
      shipmentTotal = +order.shipment_total + shipmentPromoAmount - serviceOriginal;
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
              <div className={style.row}>
                <label>
                  Promotion
                  <button type="button" className={`${style.viewPromotion}`} onClick={showPromotions}>
                    (View Details)
                  </button>
                </label>
                <span data-selenium="order-promo-total">{toPrice(promoTotal)}</span>
              </div>
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
          {!isServiceOrder && (
            <div className={`${style.row}__wrapper`}>
              <Coupon fromCheckout={fromCheckout} fromCartHeader={fromCartHeader} className={style.coupon} />
            </div>
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
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default OrderSummary;
