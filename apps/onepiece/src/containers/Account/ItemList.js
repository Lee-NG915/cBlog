import React from 'react';
import PropTypes from 'prop-types';
import { toPrice } from 'utils/number';
import { LineItemProductImage, LineItemOptions, LineItemName, LineItemBundleOptions } from 'components/LineItem';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import ShipmentStatus from './ShipmentStatus';
import style from './style.scss';

const ItemList = ({ order, simple }) => {
  const { desktop } = useBreakpoints();
  const items = order.shipments.map((shipment, shipmentIndex) => {
    let lineItems;
    // For US, https://castlery.atlassian.net/wiki/spaces/TEC/pages/715489281/Product+Level+Fulfillment
    if (shipment.line_items) {
      lineItems = shipment.line_items.map((lineItem) => {
        const item = order.line_items.find((i) => i.id === lineItem.id);
        const modifiedItem = { ...item, quantity: lineItem.quantity };
        return modifiedItem;
      });
    } else {
      lineItems = shipment.manifest.map((m) => order.line_items.find((i) => i.id === m));
    }

    const hideReview = shipment.state !== 'delivered' || !shipment.has_unreviewed_items;

    const rendered = lineItems.map((i, index) => {
      if (desktop) {
        return (
          <tr key={`${shipment.id}-${index}`}>
            <td>
              <div className={`${style.table}__item`}>
                <LineItemProductImage lineItem={i} className={`${style.table}__item__img`} mediaQuery="120px" />
                <div className={`${style.table}__item__body`}>
                  <LineItemName lineItem={i} className={`${style.table}__item__name`} />
                  <LineItemOptions lineItem={i} className={`${style.table}__item__options`} />
                  {i.warranty_items && (
                    <div className={`${style.table}__item__options`}>
                      <p>{`Extended warranty - ${i.warranty_items.duration_months} months`}</p>
                    </div>
                  )}
                  {i.variant.is_clearance && (
                    <div className={`${style.table}__item__clearance`}>
                      Note: Cancellations or Returns are not applicable for this clearance item.
                    </div>
                  )}
                </div>
              </div>
              <LineItemBundleOptions lineItem={i} mediaQuery="100px" className={`${style.table}__bundleOptions`} />
            </td>
            <td>
              <div className={`${style.table}__price`}>
                {i.is_gift
                  ? toPrice(0, true)
                  : toPrice((+i.amount + (+i.manual_discount_total || 0)) / i.quantity, true)}
              </div>
            </td>
            <td>{i.quantity}</td>
            {index === 0 && !simple && (
              <td rowSpan={shipment.manifest.length}>
                <ShipmentStatus className={`${style.table}__shipment`} shipment={shipment} />
                {!hideReview && (
                  <Link
                    className={`${style.table}__review btn btn-primary`}
                    to={`${getUrl('submit-review')}?order=${order.number}&shipment=${shipment.id}`}
                  >
                    Review
                  </Link>
                )}
              </td>
            )}
          </tr>
        );
      }
      return (
        <div key={index}>
          <div className={`${style.table}__item`}>
            <LineItemProductImage lineItem={i} className={`${style.table}__item__img`} mediaQuery="120px" />
            <div className={`${style.table}__item__body`}>
              <LineItemName lineItem={i} className={`${style.table}__item__name`} />
              <LineItemOptions lineItem={i} className={`${style.table}__item__options`} />
              {i.warranty_items && (
                <div className={`${style.table}__item__options`}>
                  <p>{`Extended warranty - ${i.warranty_items.duration_months} months`}</p>
                </div>
              )}
              {i.variant.is_clearance && (
                <div className={`${style.table}__item__clearance`}>
                  Note: Cancellations or Returns are not applicable for this clearance item.
                </div>
              )}
            </div>
            <div className={`${style.table}__item__qtyPrice`}>
              <div className={`${style.table}__price`}>
                {i.is_gift
                  ? toPrice(0, true)
                  : toPrice((+i.amount + (+i.manual_discount_total || 0)) / i.quantity, true)}
              </div>
              <div className={`${style.table}__item__qty`}>x{i.quantity}</div>
            </div>
          </div>
          <LineItemBundleOptions lineItem={i} mediaQuery="100px" className={`${style.table}__bundleOptions`} />
        </div>
      );
    });

    return desktop ? (
      rendered
    ) : (
      <div key={shipment.id} className={`${style.table}__shipmentBlock`}>
        {!simple && (
          <div className={`${style.table}__shipmentHeader`}>
            <h3>
              Shipment {shipmentIndex + 1} of {order.shipments.length}
            </h3>
            <div className={`${style.table}__shipmentHeader-right`}>
              <ShipmentStatus className={`${style.table}__shipment`} shipment={shipment} />
              {!hideReview && (
                <Link
                  className={`${style.table}__review btn btn-primary`}
                  to={`${getUrl('submit-review')}?order=${order.number}&shipment=${shipment.id}`}
                >
                  Review
                </Link>
              )}
            </div>
          </div>
        )}
        {rendered}
      </div>
    );
  });

  const services = order.addon_service_line_items.map((item) =>
    desktop ? (
      <tr key={item.id}>
        <td>
          {item.variant.name}
          <LineItemOptions lineItem={item} className={`${style.table}__item__options`} />
        </td>
        <td>{toPrice(+item.total / item.quantity, true)}</td>
        <td>{item.quantity}</td>
        <td>-</td>
      </tr>
    ) : (
      <div key={item.id} className={`${style.table}__service`}>
        <div>
          {item.variant.name}
          <LineItemOptions lineItem={item} className={`${style.table}__item__options`} />
        </div>
        <div>{toPrice(+item.total, true)}</div>
      </div>
    )
  );

  return desktop ? (
    <table className={`${style.table} table`}>
      <thead>
        <tr>
          <th className={`${style.table}__col--item`}>Item Description</th>
          <th className={`${style.table}__col--price`}>Price</th>
          <th className={`${style.table}__col--qty`}>Qty</th>
          {!simple && <th className={`${style.table}__col--lead`}>Shipping Status</th>}
        </tr>
      </thead>
      <tbody>
        {items}
        {services}
      </tbody>
    </table>
  ) : (
    <div className={style.table}>
      {items}
      {services}
    </div>
  );
};

ItemList.propTypes = {
  order: PropTypes.object.isRequired,
};

export default ItemList;
