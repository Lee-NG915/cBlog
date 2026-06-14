import React from 'react';
import SvgIcon from 'components/SvgIcon';
import classNames from 'classnames';
import Button from './Button';
import { propTypes } from './propTypes';
import style from './style.scss';

const ArrowBtn = ({ className, color, bgColor, borderColor, processing, border, hoverClass, ...rest }) => (
  <Button
    className={classNames(style.arrow, {
      [className]: !!className,
    })}
    color={color}
    backgroundcolor={bgColor}
    borderColor={borderColor}
    width="100%"
    // rightIcon={<SvgIcon name="line-right-arrow" width={24} />}
    {...rest}
  />
);

ArrowBtn.propTypes = propTypes;

export default ArrowBtn;
