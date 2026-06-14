'use client';

import { useCallback, useEffect, RefObject } from 'react';

interface UseAnchorScrollProps {
  ref: RefObject<HTMLElement>;
  anchorLink: string;
}

export const useAnchorScroll = ({ ref, anchorLink }: UseAnchorScrollProps) => {
  const scrollToTarget = useCallback(() => {
    if (ref?.current) {
      ref.current.scrollIntoView();
    }
  }, [ref]);

  useEffect(() => {
    const { hash } = window.location;
    if (anchorLink && hash === anchorLink) {
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }

      setTimeout(() => {
        scrollToTarget();
      }, 0);
    }

    return () => {
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [scrollToTarget, anchorLink]);
};
