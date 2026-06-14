'use client';

import { useEffect, useRef } from 'react';

export function useInViewDelayedCallback(callback: () => void, delay: number, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入视野，启动 3 秒计时器
            timerRef.current = setTimeout(() => {
              callback();
              timerRef.current = null;
            }, delay);
          } else {
            // 元素离开视野，清除计时器
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
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
  }, [ref, callback, delay, options]);

  return ref;
}
