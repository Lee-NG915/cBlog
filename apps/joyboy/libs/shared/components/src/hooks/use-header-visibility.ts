'use client';
import { useEffect, useState } from 'react';

export const useHeaderVisibility = () => {
  const headerSelector = '[data-header-container="true"]';
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerBottom, setHeaderBottom] = useState(0);

  useEffect(() => {
    const headerElement = document.querySelector(headerSelector);

    if (headerElement) {
      const updateHeaderPosition = () => {
        if (isHeaderVisible) {
          const rect = headerElement.getBoundingClientRect();
          setHeaderBottom(rect.bottom);
        }
      };

      updateHeaderPosition();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsHeaderVisible(entry.isIntersecting);
            updateHeaderPosition();
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        }
      );

      observer.observe(headerElement);

      const handleResize = () => {
        updateHeaderPosition();
      };

      const handleScroll = () => {
        updateHeaderPosition();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [headerSelector, isHeaderVisible]);

  return {
    isHeaderVisible,
    headerBottom,
  };
};
