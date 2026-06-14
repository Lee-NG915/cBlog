'use client';
import { useRef, useEffect } from 'react';

/**
 * @description 用于在 `value` 停止变化 `delay` 秒后执行一次回调，默认 5 秒
 * @param value 需要监听的值
 * @param delay 毫秒数，默认 5000
 * @param callback 要执行的函数
 * @param active 是否启用，默认 true
 */
export function useDelayedCallback<T>(value: T, callback: (val: T) => void, delay = 5000, active = true) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 如果不启用，直接清除定时器并退出
    if (!active) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    // 每次值变化时，清掉旧的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 开启新的定时器
    timerRef.current = setTimeout(() => {
      callback(value);
    }, delay);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, callback, active]);
}
