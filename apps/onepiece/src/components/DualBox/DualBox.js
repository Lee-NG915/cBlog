import React from 'react';
import classNames from 'classnames';
import variables from 'sass/_variables.scss';
import { Link } from 'react-router';
import style from './style.scss';
import { propTypes, defaultProps } from './propTypes';

const DualBox = ({
  containerClassName,
  containerStyle,
  leftClassName,
  rightClassName,
  leftStyle,
  rightStyle,
  leftComponent,
  rightComponent,
  whichIsTop,
  border,
  borderColor = variables.darkAccentColor,
  href,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const borderPosition = whichIsTop === 'left' ? 'bottom' : 'top';
  const classes = classNames(style.dualBox, {
    [containerClassName]: !!containerClassName,
    [`${style.dualBox}--border-dark-accent`]: border,
    [`${style.dualBox}--direction-reverse`]: whichIsTop === 'right',
  });
  const subClasses = classNames({
    [`${style.dualBox}__firstBox--border-${borderPosition}`]: border,
    [leftClassName]: !!leftClassName,
  });
  const borderStyle = {
    ...(border && !!borderColor && { borderColor }),
  };
  if (href) {
    return (
      <Link
        className={classes}
        style={{ ...borderStyle, ...containerStyle }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        to={href}
      >
        <div className={subClasses} style={{ ...borderStyle, ...leftStyle }}>
          {leftComponent && leftComponent}
        </div>
        <div className={rightClassName} style={rightStyle}>
          {rightComponent && rightComponent}
        </div>
      </Link>
    );
  }
  return (
    <div
      className={classes}
      style={{ ...borderStyle, ...containerStyle }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={onClick ? 'button' : 'textbox'}
    >
      <div className={subClasses} style={{ ...borderStyle, ...leftStyle }}>
        {leftComponent && leftComponent}
      </div>
      <div className={rightClassName} style={rightStyle}>
        {rightComponent && rightComponent}
      </div>
    </div>
  );
};
DualBox.propTypes = propTypes;
DualBox.defaultProps = defaultProps;

export default DualBox;
