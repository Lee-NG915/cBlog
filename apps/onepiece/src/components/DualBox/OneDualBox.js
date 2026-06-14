import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import DualBox from './DualBox';
import { propTypes, defaultProps } from './propTypes';
import style from './style.scss';

const OneDualBox = ({ rowReverse: colReverse, containerClassName, ...rest }) => {
  const containerClasses = classNames(style.oneDualBox, {
    [`${style.oneDualBox}--col-reverse`]: colReverse,
    [containerClassName]: !!containerClassName,
  });

  return <DualBox containerClassName={containerClasses} {...rest} />;
};
OneDualBox.propTypes = { ...propTypes, colReverse: PropTypes.bool };
OneDualBox.defaultProps = { ...defaultProps, colReverse: false };

export default OneDualBox;
