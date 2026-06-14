'use client';

import { useEffect, useRef } from 'react';

export function useInView(callback: () => void, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5, ...options }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback, options]);
  return ref;
}
