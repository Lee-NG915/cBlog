/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useEffect } from 'react';

type useIntervalProps = {
  callback: () => void;
  timeout: number | null;
};

const useInterval = (callback: () => void, timeout: number | null) => {
  const savedCallback = useRef(() => {});
  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    if (timeout !== null) {
      const interval = setInterval(() => savedCallback.current(), timeout || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [timeout]);
};

export default useInterval;
