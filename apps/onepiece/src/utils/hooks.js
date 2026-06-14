import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoints } from '@castlery/fortress/hooks';

const noop = () => {};

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current || value;
}

export const useDesktopHover = (element) => {
  const [state, setState] = useState(false);
  const { desktop } = useBreakpoints();
  const onMouseEnter = (originalOnMouseEnter) => (event) => {
    (originalOnMouseEnter || noop)(event);
    setState(true);
  };
  const onMouseLeave = (originalOnMouseLeave) => (event) => {
    (originalOnMouseLeave || noop)(event);
    setState(false);
  };

  let ele = element;
  if (typeof element === 'function') {
    ele = element(state);
  }

  const el = !desktop
    ? ele
    : React.cloneElement(ele, {
        onMouseEnter: onMouseEnter(ele.props.onMouseEnter),
        onMouseLeave: onMouseLeave(ele.props.onMouseLeave),
      });

  return [el, state];
};

export const useCallbackRef = () => {
  const [ref, setRef] = useState({ current: null });
  const refCallback = useCallback((node) => {
    if (node !== null) {
      setRef({ current: node });
    }
  }, []);
  return [ref, refCallback];
};

export const useDevice = () => {
  const { mobile, tablet, desktop } = useBreakpoints();
  const device = useMemo(() => {
    if (mobile) return 'mobile';
    if (tablet) return 'tablet';
    if (desktop) return 'desktop';
    return 'desktop';
  }, [mobile, tablet, desktop]);
  return device;
};
