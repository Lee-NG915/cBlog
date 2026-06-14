import React from 'react';
import PropTypes from 'prop-types';
import OrderSummary from 'components/OrderSummary';
import OrderSummaryV2 from 'components/OrderSummary/indexV2';
import config from 'config';
import ListItem from './ListItem';
import style from './style.scss';

const OrderSummaryContent = ({ className, data, type }) => (
  <div className={style.orderSummary}>
    <div className={`${style.orderSummary}__items`}>
      {data.map((item) => (
        <ListItem
          className={`${style.orderSummary}__item ${
            type === 'schedule_delivery' ? `${style.orderSummary}__item--schedule` : ''
          }`}
          item={item}
          key={item.id}
        />
      ))}
    </div>
    {config.enableNewPromotion ? (
      <OrderSummaryV2 fromCheckout className={className} />
    ) : (
      <OrderSummary fromCheckout className={className} />
    )}
  </div>
);

OrderSummaryContent.propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  type: PropTypes.string,
};

export default OrderSummaryContent;
