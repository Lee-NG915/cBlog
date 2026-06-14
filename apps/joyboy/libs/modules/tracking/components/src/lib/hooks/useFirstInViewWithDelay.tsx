'use client';
import { useEffect, useRef } from 'react';

/**
 * Fires `callback` exactly once, the first time the observed element has
 * stayed in the viewport for at least `delay` ms continuously. If the element
 * leaves the viewport before the dwell completes, the timer is reset; the
 * dwell must be satisfied in a single uninterrupted intersection.
 *
 * After firing, the observer is disconnected — re-entering the viewport will
 * not fire again for the lifetime of the component mount.
 *
 * Combines the semantics of `useFirstInView` (one-shot) with the dwell of
 * `useInViewDelayedCallback`.
 */
export function useFirstInViewWithDelay(callback: () => void, delay: number, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const hasFired = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ref.current || hasFired.current) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (hasFired.current) return;
          if (entry.isIntersecting) {
            timerRef.current = setTimeout(() => {
              if (hasFired.current) return;
              hasFired.current = true;
              callback();
              obs.disconnect();
              timerRef.current = null;
            }, delay);
          } else if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        });
      },
      { threshold: 0.5, ...options }
    );

    observer.observe(ref.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      observer.disconnect();
    };
  }, [callback, delay, options]);

  return ref;
}
