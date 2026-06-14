import React from 'react';
import SvgIcon from 'components/SvgIcon';
import PropTypes from 'prop-types';

import style from './style.scss';

const CloseTip = ({ className }) => (
  <div className={`${style.closeTip} ${className}`}>
    <div className={`${style.closeTip}__icon`}>
      <SvgIcon name="warning" width="18" color="color-primary" />
    </div>
    {/* Applications are currently closed for the 2023 intake. You are welcome to apply next year! */}
    Applications are currently open for the 2025 intake.
    <br />
    Are you ready to elevate your journey? The adventure awaits!
  </div>
);

CloseTip.propTypes = {
  className: PropTypes.string,
};
export default CloseTip;
