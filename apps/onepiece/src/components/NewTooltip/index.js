import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import debounce from 'utils/debounce';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Portal } from './Portal';
import style from './style.scss';

function Tooltip({ className, title, children, placement, fitPlacement }) {
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [place, setPlace] = useState(placement);
  const block = new Bem(style.tooltip).mix(className);
  const portalRef = useRef();
  const { desktop } = useBreakpoints();

  useEffect(() => {
    if (showTooltip) {
      const target = portalRef?.current?.getBoundingClientRect();
      setPlace(target?.top < 0 ? fitPlacement : placement);
    }
  }, [showTooltip, placement, fitPlacement]);

  const openTooltip = useCallback((e) => {
    e.stopPropagation();

    const rect = e.target.getBoundingClientRect();

    setCoords({
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height / 2,
    });

    setShowTooltip(true);
  }, []);

  const closeTooltip = debounce(() => {
    if (showTooltip) {
      setShowTooltip(false);
      setPlace(placement);
    }
  }, 10);

  useEffect(() => {
    if (!desktop) {
      const handleBlur = (e) => {
        if (portalRef.current && !portalRef.current.contains(e.target)) {
          closeTooltip();
        }
      };

      document.addEventListener('click', handleBlur);
      window.addEventListener('scroll', closeTooltip, true);

      return () => {
        document.removeEventListener('click', handleBlur);
        window.removeEventListener('scroll', closeTooltip, true);
      };
    }
  }, [showTooltip, closeTooltip, desktop]);

  return (
    <div
      className={block}
      onMouseEnter={(e) => {
        if (desktop) {
          openTooltip(e);
        }
      }}
      onMouseLeave={() => {
        if (desktop) {
          closeTooltip();
        }
      }}
      onClick={(e) => {
        if (!desktop) {
          openTooltip(e);
        }
      }}
    >
      {children}

      {showTooltip && (
        <Portal>
          <div
            style={{
              left: coords.left,
              top: coords.top,
            }}
            ref={portalRef}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={block.elm('title').state([place], place)}
          >
            {typeof title === 'string'
              ? title
              : Array.isArray(title) && title.length > 0
              ? title.map((item, index) => <p key={index}>{item}</p>)
              : ''}
          </div>
        </Portal>
      )}
    </div>
  );
}

Tooltip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placement: PropTypes.oneOf(['top', 'topRight', 'bottom', 'bottomRight']),
  fitPlacement: PropTypes.oneOf(['top', 'topRight', 'bottom', 'bottomRight']),
};

Tooltip.defaultProps = {
  placement: 'top',
  fitPlacement: 'bottom',
};

export default Tooltip;
