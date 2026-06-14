import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactSVG from 'components/ReactSVG';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import config from 'config';
import Tooltip from './index';
import style from './style.scss';

const TooltipEllipsis = ({ children, title, placement, fitPlacement, hideIcon, ...props }) => {
  const [showPopover, setShowPopover] = useState(false);
  const copyRef = useRef();

  const validShowPopover = useCallback(() => {
    const { scrollWidth, clientWidth } = copyRef?.current || {};
    setShowPopover(scrollWidth > clientWidth);
  }, [copyRef]);

  useEffect(() => {
    validShowPopover();
  }, [validShowPopover]);

  const refChildren = (ref) => {
    copyRef.current = ref;
  };

  const renderChildren = () =>
    React.cloneElement(children, {
      ref: refChildren,
    });

  if (showPopover) {
    return (
      <>
        {hideIcon ? (
          <Tooltip
            title={title}
            placement={placement}
            fitPlacement={fitPlacement}
            className={classNames(
              `${style.tooltipEllipsis} ${style.tooltipEllipsis}__simple${config.enableNewPromotion ? 'V2' : ''}`
            )}
            {...props}
          >
            {renderChildren()}
          </Tooltip>
        ) : (
          <>
            {renderChildren()}
            <Tooltip
              title={title}
              placement={placement}
              fitPlacement={fitPlacement}
              className={style.tooltipEllipsis}
              {...props}
            >
              <ReactSVG name="normal-info" />
            </Tooltip>
          </>
        )}
      </>
    );
  }
  return renderChildren();
};

TooltipEllipsis.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placement: PropTypes.oneOf(['top', 'bottom', 'topRight', 'bottomRight']),
  fitPlacement: PropTypes.oneOf(['top', 'bottom', 'topRight', 'bottomRight']),
  hideIcon: PropTypes.bool,
};

export default TooltipEllipsis;
