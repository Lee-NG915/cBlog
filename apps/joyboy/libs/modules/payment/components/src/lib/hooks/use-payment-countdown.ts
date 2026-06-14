'use client';
import { useState, useEffect } from 'react';

/**
 * Counts down to the payment expiry time.
 * Returns null until paymentExpiredAt is provided.
 */
export function usePaymentCountdown(paymentExpiredAt: string | null): {
  remainingMs: number | null;
  isExpired: boolean;
  formattedCountdown: string;
} {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!paymentExpiredAt) return;

    const endTime = new Date(paymentExpiredAt).getTime();

    const tick = () => {
      const diff = endTime - Date.now();
      setRemainingMs(Math.max(0, diff));
    };

    tick(); // run immediately to avoid blank first frame
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [paymentExpiredAt]);

  const isExpired = remainingMs !== null && remainingMs === 0;
  const formattedCountdown = remainingMs !== null ? formatCountdown(remainingMs) : '';

  return { remainingMs, isExpired, formattedCountdown };
}

/** Formats milliseconds as H:MM:SS (e.g. "1:59:07") */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
