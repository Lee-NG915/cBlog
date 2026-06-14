import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.scss';

const Spinner = ({ right, className, inline, small, color = 'white', type, width = 'auto', style: propsStyle }) => {
  const svg = (
    <svg className="circular" viewBox="25 25 50 50">
      <circle className="path" cx="50" cy="50" r="20" fill="none" strokeMiterlimit="10" />
    </svg>
  );

  const spinnerStyle = {
    ...(width !== 'auto' && {
      width: typeof width === 'string' ? width : `${width}px`,
    }),
    ...propsStyle,
  };

  if (type === 'dark' || type === 'light') {
    return (
      <div className={classNames(style.newSpinner, `${style.newSpinner}--${type}`, className)} style={spinnerStyle}>
        {svg}
      </div>
    );
  }

  if (right) {
    return <div className={classNames(style.spinner, `${style.spinner}--right`, className)}>{svg}</div>;
  }
  if (inline) {
    return (
      <span className={style.inline}>
        &nbsp;
        <div className={classNames(style.spinner, `${style.spinner}--small`, className)}>{svg}</div>
      </span>
    );
  }
  if (small) {
    return (
      <div
        className={classNames(style.spinner, `${style.spinner}--small`, `${style.spinner}--color-${color}`, className)}
      >
        {svg}
      </div>
    );
  }
  return (
    <div className={classNames(style.spinner, className)} style={propsStyle}>
      {svg}
    </div>
  );
};

Spinner.propTypes = {
  right: PropTypes.bool,
  inline: PropTypes.bool,
  small: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(['dark', 'light']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};

export default Spinner;
