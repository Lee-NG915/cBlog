import { useEffect, useRef, useState } from 'react';

const useSlickAutoHover = (galleryRef: React.RefObject<HTMLElement>) => {
  const slideListRef = useRef<HTMLElement | null>();
  const [isEnterGallery, setIsEnterGallery] = useState(false);
  useEffect(() => {
    slideListRef.current = galleryRef.current?.querySelector('.slick-list');
    return () => {
      slideListRef.current = null;
    };
  }, [galleryRef]);

  useEffect(() => {
    if (!slideListRef.current) return;
    const element = slideListRef.current;

    const handleHover = () => setIsEnterGallery(true);
    const handleLeave = () => setIsEnterGallery(false);
    element.addEventListener('mouseenter', handleHover);
    element.addEventListener('mouseleave', handleLeave);
    return () => {
      element.removeEventListener('mouseenter', handleHover);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [galleryRef]);

  return {
    isEnterGallery,
  };
};

export default useSlickAutoHover;
