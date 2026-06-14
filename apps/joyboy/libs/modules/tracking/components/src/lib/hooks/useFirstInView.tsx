'use client';
import { useEffect, useRef } from 'react';

export function useFirstInView(callback: () => void, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (!ref.current || hasFired.current) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasFired.current) {
          hasFired.current = true;
          callback();
          obs.disconnect();
        }
      });
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback, options, hasFired, ref]);

  return ref;
}
