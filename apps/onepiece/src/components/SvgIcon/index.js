import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ICON_CONFIGS } from './config';
import style from './style.scss';

export default function SvgIcon({ name, ...otherProps }) {
  const { defaultWidth = 20, defaultHeight = 20, defaultColor = 'dark-neutral' } = ICON_CONFIGS[name] || {};
  const {
    role,
    label,
    width,
    height,
    color = defaultColor,
    hoverColor,
    className,
    marginLeft = 0,
    marginRight = 0,
    style: propStyle = {},
    ...rest
  } = otherProps;

  const ratio = useMemo(() => defaultWidth / defaultHeight, [defaultWidth, defaultHeight]);
  let size;
  if (width && !height) {
    size = {
      width,
      height: width / ratio,
    };
  } else if (!width && height) {
    size = {
      width: height * ratio,
      height,
    };
  } else if (width && height) {
    size = {
      width,
      height,
    };
  } else {
    size = {
      width: defaultWidth,
      height: defaultHeight,
    };
  }

  const classes = classNames(`${style.svg}--color-${color}`, {
    [`${style.svg}--hover-${hoverColor}`]: !!hoverColor,
    [className]: !!className,
  });

  return (
    <svg
      className={classes}
      {...rest}
      role={role}
      aria-label={label || name}
      {...size}
      style={{
        ...(marginLeft && { marginLeft }),
        ...(marginRight && { marginRight }),
        ...propStyle,
      }}
    >
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}

SvgIcon.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
  label: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  className: PropTypes.string,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  style: PropTypes.object,
};
