import React from 'react';
import PropTypes from 'prop-types';
import { toPrice } from 'utils/number';
import style from './style.scss';

const PriceDisplay = ({ price, originalPrice, priceCanBeFree = true, showPlusSymbol }) => {
  if (originalPrice !== price && typeof originalPrice !== 'undefined') {
    return (
      <span className={style.priceDisplay}>
        <span className={`${style.priceDisplay}__price`}>
          {showPlusSymbol && <span>+</span>}
          {toPrice(price, priceCanBeFree)}
        </span>
        <span className={`${style.priceDisplay}__origin-price`}>
          {showPlusSymbol && <span>+</span>}
          {toPrice(originalPrice)}
        </span>
      </span>
    );
  }
  return (
    <span className={style.priceDisplay}>
      <span className={`${style.priceDisplay}__price`}>
        {showPlusSymbol && <span>+</span>}
        {toPrice(price, true)}
      </span>
    </span>
  );
};

PriceDisplay.propTypes = {
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  originalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  priceCanBeFree: PropTypes.bool,
  showPlusSymbol: PropTypes.bool,
};

export default PriceDisplay;
