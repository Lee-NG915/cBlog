'use client';

import { useState, useCallback } from 'react';

export const useCallbackRef = () => {
  const [ref, setRef] = useState({ current: null });
  const refCallback = useCallback((node) => {
    if (node !== null) {
      setRef({ current: node });
    }
  }, []);
  return [ref, refCallback];
};
