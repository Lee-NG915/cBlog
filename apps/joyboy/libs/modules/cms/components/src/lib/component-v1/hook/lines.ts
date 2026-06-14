import { useEffect, useState, useCallback, RefObject } from 'react';

export const useNumberOfLines = (elementRef: RefObject<HTMLElement>) => {
  const [numberOfLines, setNumberOfLines] = useState(1);

  const getNumberOfLines = useCallback((element: HTMLElement) => {
    const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
    const containerHeight = element.offsetHeight;
    return Math.round(containerHeight / lineHeight);
  }, []);

  const updateNumberOfLines = useCallback(() => {
    if (elementRef.current) {
      const numberOfLines = getNumberOfLines(elementRef.current);
      setNumberOfLines(numberOfLines);
    }
  }, [elementRef, getNumberOfLines]);

  useEffect(() => {
    updateNumberOfLines();
    window.addEventListener('resize', updateNumberOfLines);

    return () => {
      window.removeEventListener('resize', updateNumberOfLines);
    };
  }, [updateNumberOfLines]);

  return numberOfLines;
};
