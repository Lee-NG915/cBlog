import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import OrderItem from './OrderItem';

import style from './style.scss';

const ShipmentItems = ({ items, className }) => {
  const block = new Bem(style.shipmentItems).mix(className);

  return (
    <div className={block}>
      <div className={block.elm('items')}>
        {items.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            className={block.elm('orderItem').toString()}
            direction="row"
            showBundle
          />
        ))}
      </div>
    </div>
  );
};
ShipmentItems.propTypes = {
  items: PropTypes.array,
  className: PropTypes.string,
};

export default ShipmentItems;
