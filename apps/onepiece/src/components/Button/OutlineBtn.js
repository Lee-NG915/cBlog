import React from 'react';
import Button from './Button';
import { propTypes } from './propTypes';
import style from './style.scss';

const OutlineBtn = ({ color, backgroundcolor, borderColor, border = true, hoverClass, ...rest }) => (
  <Button
    color={color || 'dark-accent'}
    backgroundcolor={backgroundcolor || 'transparent'}
    borderColor={borderColor || 'dark-accent'}
    hoverClass={hoverClass || `${style.outline}--hover`}
    border={border}
    {...rest}
  />
);

OutlineBtn.propTypes = propTypes;

export default OutlineBtn;
