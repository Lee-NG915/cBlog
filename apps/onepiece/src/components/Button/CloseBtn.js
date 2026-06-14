import React from 'react';
import SvgIcon from 'components/SvgIcon';
import Button from './Button';
import { propTypes } from './propTypes';
import style from './style.scss';

const CloseBtn = ({ color, backgroundcolor, border, hoverClass, ...rest }) => (
  <Button
    width="50px"
    color={color || 'dark-accent'}
    backgroundcolor={backgroundcolor || 'transparent'}
    leftIcon={<SvgIcon name="close" color={color || 'dark-accent'} />}
    hoverClass={hoverClass || `${style.close}--hover`}
    {...rest}
  />
);

CloseBtn.propTypes = propTypes;

export default CloseBtn;
