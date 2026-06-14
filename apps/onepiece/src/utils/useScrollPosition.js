import { useRef, useEffect, useLayoutEffect } from 'react';

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const getScrollPosition = ({ element, useWindow }) => {
  if (__SERVER__) {
    return { x: 0, y: 0, rate: '0%' };
  }

  const target = element ? element.current : document.body;
  const position = target.getBoundingClientRect();
  if (position.height === 0) {
    return { x: 0, y: 0, rate: '0%' };
  }
  const percentage = ((window.innerHeight - position.top) / Math.floor(position.height)).toFixed(2);
  const rate = percentage >= 1 ? 100 : percentage * 100;

  // #TODO: add rate support when useWindow
  return useWindow ? { x: window.scrollX, y: window.scrollY } : { x: position.left, y: position.top, rate };
};

const useScrollPosition = ({ effect, element, useWindow = false, wait = 300, deps }) => {
  const position = useRef(getScrollPosition({ useWindow }));

  let throttleTimeout = null;

  const callBack = () => {
    const currPos = getScrollPosition({ element, useWindow });
    effect({ prevPos: position.current, currPos });
    position.current = currPos;
    throttleTimeout = null;
  };

  useIsomorphicEffect(() => {
    const handleScroll = () => {
      if (wait) {
        if (throttleTimeout === null) {
          throttleTimeout = setTimeout(callBack, wait);
        }
      } else {
        callBack();
      }
    };

    // #FIXME: use a more common element to register scroll event.
    element.current.parentNode.parentNode.addEventListener('scroll', handleScroll);

    return () => element.current.parentNode.parentNode.removeEventListener('scroll', handleScroll);
  }, deps);
};

export default useScrollPosition;
