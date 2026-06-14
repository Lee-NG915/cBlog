import { useEffect } from 'react';

export function useOnLoad(callback) {
  useEffect(() => {
    const handleLoad = () => {
      callback();
    };

    window.addEventListener('load', handleLoad);

    // revmoveEventListener
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [callback]);
}
