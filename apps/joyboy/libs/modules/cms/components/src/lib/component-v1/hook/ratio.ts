import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';

type AspectRatioConfig = {
  [key: string]: number;
};

export const useImgRatio = (
  size: string,
  aspectRatioConfig: AspectRatioConfig,
  textRef: React.RefObject<HTMLElement>,
  widthPercentage: number
): number => {
  const [imgRatio, setImgRatio] = useState<number>(aspectRatioConfig[size]);

  useEffect(() => {
    const handleResize = debounce(() => {
      if (textRef?.current) {
        const height = textRef.current.clientHeight;
        const windowWidth = window.innerWidth;
        const ratio = height / (windowWidth * widthPercentage);
        setImgRatio(ratio);
      }
    }, 300);

    handleResize();

    // Attach resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [textRef, widthPercentage]);

  return imgRatio;
};
