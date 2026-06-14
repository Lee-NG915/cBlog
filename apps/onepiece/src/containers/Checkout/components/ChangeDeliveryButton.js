import React from 'react';
import PropTypes from 'prop-types';
import { CalendarEdit } from '@castlery/fortress/Icons';
import { useDeliveryPeriodButtonTest } from 'hooks/ABTest/checkout';
import style from './style.scss';

export default function ChangeDeliveryButton({ onClick, className, children }) {
  const { text: variantText, reportClick } = useDeliveryPeriodButtonTest();
  const classNames = className ? `${style.requestBtn} btn ${className}` : `${style.requestBtn} btn`;

  const handleClick = (e) => {
    reportClick && reportClick();
    onClick && onClick(e);
  };

  const text = variantText || children || 'Request for preferred delivery period';
  return (
    <button
      type="button"
      className={classNames}
      onClick={(e) => {
        handleClick(e);
      }}
    >
      {text}
      <CalendarEdit />
    </button>
  );
}

ChangeDeliveryButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
