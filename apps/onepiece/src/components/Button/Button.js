import React, { useState, useMemo, useCallback } from 'react';

import { Link } from 'react-router';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { propTypes } from './propTypes';
import style from './style.scss';

const Button = (props) => {
  const { desktop } = useBreakpoints();
  const { backgroundcolor = 'primary' } = props;
  const {
    className,
    type = 'button',
    href,
    color = 'light-neutral',
    borderColor = 'primary',
    shape = 'square',
    size = 'large',
    width = 'auto',
    text = '',
    leftIcon,
    rightIcon,
    block = false,
    border = false,
    disabled = false,
    disabledClass = `${style.button}--disabled`,
    loading = false,
    hoverClass = `${style.button}--hover-${backgroundcolor}`,
    hoverStyle = null,
    style: propStyle,
    onClick,
    ...rest
  } = props;

  const [hovering, setHovering] = useState(false);
  const {
    color: hoverContentColor,
    backgroundColor: hoverBackgroundColor,
    borderColor: hoverBorderColor,
  } = hoverStyle || {};
  const classes = classNames(style.button, `${style.button}--color-${color}`, {
    [`${style.button}--background-${backgroundcolor}`]: !disabled,
    [`${style.button}--border-${borderColor}`]: border,

    [hoverClass]: !hoverStyle && hovering,
    [`${style.button}--hoverContent-${hoverContentColor}`]: !!hoverContentColor && hovering,
    [`${style.button}--hoverBg-${hoverBackgroundColor}`]: !!hoverBackgroundColor && hovering,
    [`${style.button}--hoverBorder-${hoverBorderColor}`]: !!hoverBorderColor && hovering,

    [`${style.button}-icon-only`]: !text,
    [`${style.button}--${shape}`]: shape !== 'square' && shape,
    [`${style.button}--${size}`]: size !== 'large' && size,
    [disabledClass]: disabled,
    [className]: !!className,
  });

  const btnStyle = {
    ...(block && { display: 'block' }),
    ...(width !== 'auto' && {
      width: typeof width === 'string' ? width : `${width}px`,
    }),
    ...(border && size === 'large' && { lineHeight: '48px' }),
    ...(border && size === 'medium' && { lineHeight: '38px' }),
    ...(border && size === 'small' && { lineHeight: '28px' }),
    ...propStyle,
  };

  const hoverHandlers = useMemo(() => {
    if (disabled) {
      if (hovering) setHovering(false);
      return {};
    }

    if (desktop) {
      return {
        onMouseEnter: () => {
          setHovering(true);
        },
        onMouseLeave: () => {
          setHovering(false);
        },
      };
    }
    return {
      onTouchStart: () => {
        setHovering(true);
      },
      onTouchEnd: () => {
        setHovering(false);
      },
    };
  }, [disabled, hovering]);

  const handleClick = useCallback(
    (event) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      if (onClick) {
        onClick(event);
      }
    },
    [disabled, loading, onClick]
  );

  const childrenElement = (
    <>
      <div
        className={classNames(`${style.button}__content`, {
          [`${style.button}__content-hidden`]: loading,
        })}
      >
        {leftIcon && leftIcon}
        <span>{text}</span>
        {rightIcon && rightIcon}
      </div>
      {loading && <Spinner small color={color} className={`${style.button}__loading`} />}
    </>
  );
  if (/http[s]*|^#/.test(href)) {
    return (
      <a href={href} className={classes} style={btnStyle} {...hoverHandlers} {...rest}>
        {childrenElement}
      </a>
    );
  }

  if (href || (type !== 'submit' && block)) {
    return (
      <Link to={href} className={classes} style={btnStyle} onClick={handleClick} {...hoverHandlers} {...rest}>
        {childrenElement}
      </Link>
    );
  }

  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      className={classes}
      style={btnStyle}
      onClick={handleClick}
      disabled={disabled}
      {...hoverHandlers}
      {...rest}
    >
      {childrenElement}
    </button>
  );
};

Button.propTypes = propTypes;
export default Button;
