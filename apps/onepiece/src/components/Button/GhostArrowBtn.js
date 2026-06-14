import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import classNames from 'classnames';
import Button from './Button';
import { propTypes } from './propTypes';
import style from './style.scss';

const GhostArrowBtn = ({
  className,
  color,
  backgroundcolor,
  borderColor,
  border = true,
  hoverClass,
  disabledClass,
  rightIcon,
  direction = 'right',
  hasArrow = true,
  arrowMargin = 25,
  ...rest
}) => (
  <Button
    className={classNames(style.ghostArrow, {
      [className]: !!className,
    })}
    color={color || 'dark-accent'}
    backgroundcolor={backgroundcolor || 'white'}
    borderColor={borderColor || 'dark-accent'}
    rightIcon={hasArrow && direction === 'right' ? <SvgIcon name="line-right-arrow" marginLeft={arrowMargin} /> : null}
    leftIcon={hasArrow && direction === 'left' ? <SvgIcon name="line-left-arrow" marginRight={arrowMargin} /> : null}
    border={border}
    hoverClass={hoverClass || `${style.ghostArrow}--hover-${+border}`}
    disabledClass={disabledClass || `${style.ghostArrow}--disable`}
    {...rest}
  />
);

GhostArrowBtn.propTypes = { ...propTypes, hasArrow: PropTypes.bool };

export default GhostArrowBtn;
