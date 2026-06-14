import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';

import style from './style.scss';

const Quantity = ({
  onMinus,
  onPlus,
  minusDisabled,
  plusDisabled,
  quantity,
  className,
  minusDataSelenium,
  plusDataSelenium,
}) => (
  <div className={classNames(style.quantity, className)}>
    <button onClick={onMinus} type="button" disabled={minusDisabled} className="btn" data-selenium={minusDataSelenium}>
      <ReactSVG name="minus" />
    </button>
    <label>{quantity}</label>
    <button onClick={onPlus} type="button" disabled={plusDisabled} className="btn" data-selenium={plusDataSelenium}>
      <ReactSVG name="plus" />
    </button>
  </div>
);

Quantity.propTypes = {
  onMinus: PropTypes.func,
  onPlus: PropTypes.func,
  minusDisabled: PropTypes.bool,
  plusDisabled: PropTypes.bool,
  quantity: PropTypes.number,
  className: PropTypes.string,
  minusDataSelenium: PropTypes.string,
  plusDataSelenium: PropTypes.string,
};

export default Quantity;
