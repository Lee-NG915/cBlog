import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

export const useImgRatio = (size, aspectRatioConfig, textRef, widthPercentage) => {
  const [imgRatio, setImgRatio] = useState(aspectRatioConfig[size]);

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
  }, [textRef, widthPercentage]);

  return imgRatio;
};
