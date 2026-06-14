import React from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

const Props = {
  stopAnimation: PropTypes.bool,
  children: PropTypes.element,
  bgColor: PropTypes.string,
};
function Spot(props) {
  const { children, stopAnimation, bgColor = '#fff', ...propArgs } = props;

  return (
    <div
      className={`${style.spot} ${stopAnimation ? 'stopAnimation' : ''}`}
      style={{ '--bgColor': bgColor }}
      {...propArgs}
    >
      {children}
    </div>
  );
}
Spot.propTypes = Props;
export default Spot;
