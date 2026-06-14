import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import { formatTime } from 'utils/time';
import AddressDisplay from 'components/AddressDisplay';
import PaymentDisplay from 'components/PaymentDisplay';
import { toPrice } from 'utils/number';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import ReactSVG from 'components/ReactSVG';
import lang from 'utils/lang';
import config from 'config';
import style from './style.scss';
import ItemList from './ItemList';

const OrderDetails = (props) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    const client = new ApiClient();
    const { location } = props;
    const { number } = location.query;
    setLoading(true);
    client
      .get(`/orders/${number}`, {
        auth: 'strict',
      })
      .then((result) => {
        setLoading(false);
        setOrder(result);
      })
      .catch((error) => {
        setLoading(false);
        setError(error.errors[0].detail);
      });
  }, [props]);

  useEffect(() => {
    load();
  }, [load]);

  // calculate promotion
  let coupon;
  let promoTotal;
  let manualDiscountTotal;
  let additionalTaxTotal;
  let shipmentTotal;
  let servicesTotal;
  let giftTotal = 0;

  let servicePromo = 0;
  let shipmentPromo = 0;
  if (order) {
    giftTotal = order.line_items
      .filter((item) => !!item.is_gift)
      .reduce((result, item) => result + (Number(item.amount) || 0), 0);
    manualDiscountTotal = order.line_items.reduce((result, item) => result + +(item.manual_discount_total || ''), 0);
    coupon = order.coupon ? +order.coupon.amount : 0;
    additionalTaxTotal = +order.additional_tax_total;
    servicePromo = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'shipment_service_fee')
      .reduce((acc, promotion) => acc + +promotion.amount, 0);
    shipmentPromo = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'shipment')
      .reduce((acc, promotion) => acc + +promotion.amount, 0);

    // promotion 总价需要减掉 gift 的价格
    const promotionGiftTotal = order.promotions
      .filter((promotion) => promotion.adjustable_type === 'gift')
      .reduce((result, promotion) => result + Math.abs(Number(promotion.amount)), 0);
    promoTotal =
      +order.adjustment_total -
      coupon -
      manualDiscountTotal -
      additionalTaxTotal -
      shipmentPromo -
      servicePromo +
      promotionGiftTotal;

    servicesTotal = +order.service_fee_total || 0;
    shipmentTotal = +order.shipment_total - servicesTotal;
  }
  return (
    <div className={style.orderDetails}>
      <div className={`${style.orderDetails}__back`}>
        <Link to={getUrl('orders')}>
          <ReactSVG name="arrow-prev" />
          Back
        </Link>
      </div>
      <h1 className={style.header}>Order Details</h1>
      {loading ? (
        <div className={`${style.orderDetails}__loading`}>
          <Spinner />
        </div>
      ) : order ? (
        <div className={`${style.orderDetails}__detail`}>
          <div className={`${style.orderDetails}__block`}>
            <div className={`${style.orderDetails}__row`}>
              <div className={`${style.orderDetails}__field`}>
                <label>Order No:</label>
                <span>{order.reference_number}</span>
              </div>
              <div className={`${style.orderDetails}__field`}>
                <label>Order Placed:</label>
                <span>{formatTime(order.completed_at)}</span>
              </div>
            </div>
          </div>
          <div className={`${style.orderDetails}__block`}>
            <div className={`${style.orderDetails}__row`}>
              <div className={`${style.orderDetails}__largeField`}>
                <h2>Delivery Address</h2>
                <div>
                  <AddressDisplay className={`${style.orderDetails}__address`} address={order.ship_address} />
                </div>
              </div>
              <div className={`${style.orderDetails}__largeField`}>
                <h2>Billing Address</h2>
                <div>
                  <AddressDisplay className={`${style.orderDetails}__address`} address={order.bill_address} />
                </div>
              </div>
            </div>
            {order.selected_assembly_preferences && (
              <div className={`${style.orderDetails}__row`}>
                <div className={`${style.orderDetails}__largeField`}>
                  <h2>Assembly preference</h2>
                  <div>{order.selected_assembly_preferences.map((preference) => preference.title).join(', ')}</div>
                </div>
              </div>
            )}
            {order.special_instructions && (
              <div className={`${style.orderDetails}__row`}>
                <div className={`${style.orderDetails}__field`}>
                  <label>Delivery Remark:</label>
                  <span>{order.special_instructions}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`${style.orderDetails}__block`}>
            <div className={`${style.orderDetails}__largeField`}>
              <h2>Payment Details</h2>
              <div>
                <PaymentDisplay className={`${style.orderDetails}__payment`} payments={order.payments} />
              </div>
            </div>
          </div>
          <div className={`${style.orderDetails}__block`}>
            <div className={`${style.orderDetails}__largeField`}>
              <h2 className={`${style.orderDetails}__list-title`}>Item List</h2>
              <div>
                <ItemList order={order} />
              </div>
            </div>
          </div>
          <div className={`${style.orderDetails}__block`}>
            <div className={`${style.orderDetails}__row ${style.orderDetails}__row--reversed`}>
              <div className={`${style.orderDetails}__summary`}>
                <div className={`${style.orderDetails}__summary__row`}>
                  <label>Item Subtotal</label>
                  <span>{toPrice(+order.item_total + manualDiscountTotal - giftTotal, true)}</span>
                </div>
                {order?.warranty_total > 0 && (
                  <div className={`${style.orderDetails}__summary__row`}>
                    <label>Warranty Subtotal</label>
                    <span>{toPrice(order.warranty_total)}</span>
                  </div>
                )}
                <div className={`${style.orderDetails}__summary__row`}>
                  <label>Shipping</label>
                  {/* <span>{toPrice(shipmentTotal, true)}</span> */}
                  {shipmentPromo === 0 ? (
                    <span data-selenium="order-services-total">{toPrice(shipmentTotal, true)}</span>
                  ) : (
                    <div>
                      <span
                        data-selenium="order-shipment-original"
                        style={{
                          color: '#888',
                          textDecoration: 'line-through',
                          marginRight: '0.5rem',
                        }}
                      >
                        {toPrice(shipmentTotal)}
                      </span>
                      <span data-selenium="order-shipment-total" style={{ color: '#888' }}>
                        {toPrice(shipmentTotal + shipmentPromo, true)}
                      </span>
                    </div>
                  )}
                </div>
                {!!servicesTotal && (
                  <div className={`${style.orderDetails}__summary__row`}>
                    <label>Services</label>
                    {/* <span>{toPrice(servicesTotal)}</span> */}

                    {servicePromo === 0 ? (
                      <span data-selenium="order-services-total">{toPrice(servicesTotal)}</span>
                    ) : (
                      <div className={style.shippingCap}>
                        <span
                          data-selenium="order-services-original"
                          style={{
                            color: '#888',
                            textDecoration: 'line-through',
                            marginRight: '0.5rem',
                          }}
                        >
                          {toPrice(servicesTotal)}
                        </span>
                        <span data-selenium="order-services-total" style={{ color: '#888' }}>
                          {toPrice(servicesTotal + servicePromo, true)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {promoTotal !== 0 && (
                  <div className={`${style.orderDetails}__summary__row`}>
                    <label>Promotion</label>
                    <span>{toPrice(promoTotal)}</span>
                  </div>
                )}
                {order.coupon && (
                  <div className={`${style.orderDetails}__summary__row`}>
                    <label>
                      Coupon Code: <strong>{order.coupon.code.toUpperCase()}</strong>
                    </label>
                    <span>
                      {order.coupon?.free_gift
                        ? 'Free Gift'
                        : toPrice(+order.coupon.amount + +order.warranty_total_discount)}
                    </span>
                  </div>
                )}
                {!!additionalTaxTotal && (
                  <div className={`${style.orderDetails}__summary__row`}>
                    <label>Sales Tax</label>
                    <span>{toPrice(additionalTaxTotal)}</span>
                  </div>
                )}
                <hr />
                <div className={`${style.orderDetails}__summary__row`}>
                  <label>
                    Total <em>{config.showTaxPolicy ? `(${lang.t('common.tax_policy')})` : ''}</em>
                  </label>
                  <span className="is-bold">{toPrice(order.total, true)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${style.orderDetails}__helper`}>
          <p>{error || 'Oops! Something went wrong.'}</p>
          <button type="button" className="btn btn-primary" onClick={load}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
