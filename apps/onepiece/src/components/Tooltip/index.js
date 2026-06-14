import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const Tooltip = ({ children, className, title, placement }) => {
  const [visible, setVisible] = useState(false);
  const { desktop } = useBreakpoints();

  const handleClick = () => {
    if (!desktop) {
      setVisible(!visible);
    }
  };

  useEffect(() => {
    if (!desktop) {
      const handleBlur = () => {
        if (visible) {
          setVisible(false);
        }
      };

      document.addEventListener('click', handleBlur);
      return () => {
        document.removeEventListener('click', handleBlur);
      };
    }
  }, [visible]);

  return (
    <div className={classNames(className, style.tooltip)}>
      <div role="menuitem" onClick={handleClick}>
        {children}
      </div>
      {title && (
        <span
          className={classNames(`${style.tooltip}__title`, {
            'is-shown': visible,
            [placement]: placement,
          })}
        >
          {title}
        </span>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  placement: PropTypes.oneOf(['top', 'left', 'right', 'bottom']),
};
Tooltip.defaultProps = {
  placement: 'bottom',
};
export default Tooltip;
