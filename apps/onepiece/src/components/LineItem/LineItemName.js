import React from 'react';
import PropTypes from 'prop-types';
import { getLineItemLink } from 'utils/link';
import { Link } from 'react-router';
import config from 'config';
import style from './style.scss';

const LineItemName = (props, { frame }) => {
  const { lineItem, className, showLink, showQuantity } = props;

  const nameComponent = (
    <div className={`${style.name} ${className}`}>
      {lineItem.product_type === 'swatch' || lineItem.product_type === 'service'
        ? lineItem.variant.name
        : lineItem.variant.product_name}
      {/* {lineItem.variant.product_name} */}
      {showQuantity && ` x ${lineItem.quantity}`}
      {(lineItem.gift_id || lineItem.is_gift) && (
        <div className={`${style.name}__badge${config.enableNewPromotion ? 'V2' : ''}`}>GIFT</div>
      )}
      {lineItem.pair_up_info && <div className={`${style.name}__badge`}>BUNDLE SALE</div>}
    </div>
  );

  if (lineItem.product_type !== 'swatch' && lineItem.product_type !== 'service' && showLink) {
    const link = getLineItemLink(lineItem);
    if (link) {
      return (
        <Link
          href={`${__BASE_URL__}${link}`}
          onClick={() => frame.removeModal()}
          sx={{
            textDecoration: 'underline',
          }}
        >
          {nameComponent}
        </Link>
      );
    }
  }

  return nameComponent;
};

LineItemName.propTypes = {
  lineItem: PropTypes.object.isRequired,
  className: PropTypes.string,
  showLink: PropTypes.bool,
  showQuantity: PropTypes.bool,
};

LineItemName.defaultProps = {
  showLink: true,
};

LineItemName.contextTypes = {
  frame: PropTypes.object.isRequired,
};

export default LineItemName;
