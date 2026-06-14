import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import DualBox from './DualBox';
import { propTypes, defaultProps } from './propTypes';
import style from './style.scss';

const BannerEqualDualBox = ({
  rowReverse,
  containerClassName,
  leftClassName,
  leftComponent,
  leftBanner,
  rightClassName,
  rightComponent,
  ...rest
}) => {
  const containerClasses = classNames(style.equalDualBox, {
    [`${style.equalDualBox}--row-reverse`]: rowReverse,
    [containerClassName]: !!containerClassName,
  });
  const rightClasses = classNames(`${style.equalDualBox}__rightWrapper`, {
    [rightClassName]: !!rightClassName,
  });
  const cls = `${style.equalDualBox}__border`;
  const leftClasses = classNames({
    [cls]: rowReverse,
    [leftClassName]: true,
  });

  return (
    <DualBox
      containerClassName={containerClasses}
      leftClassName={leftClasses}
      leftComponent={leftBanner}
      rightClassName={`${style.equalDualBox}__rightBox`}
      rightComponent={<div className={rightClasses}>{rightComponent}</div>}
      {...rest}
    />
  );
};

BannerEqualDualBox.propTypes = {
  ...propTypes,
  leftBanner: PropTypes.element,
  rowReverse: PropTypes.bool,
};
BannerEqualDualBox.defaultProps = { ...defaultProps, rowReverse: false };

export default BannerEqualDualBox;
