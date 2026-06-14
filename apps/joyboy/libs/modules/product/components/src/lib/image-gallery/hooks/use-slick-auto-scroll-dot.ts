import { useBreakpoints } from '@castlery/fortress';
import { useEffect, useRef } from 'react';
import { RefObject } from 'react'; // Importing RefObject type for galleryRef
import { animate } from '../../utils';
// Assuming useBreakpoints and animate are imported from somewhere

interface Breakpoints {
  desktop: boolean;
}

export const useSlickAutoScrollDot = (
  galleryRef: RefObject<HTMLElement>, // Using HTMLElement as a general type, adjust as needed
  index: number
): void => {
  // Function doesn't return anything
  const slickDots = useRef<HTMLElement | null>(null); // Specifying the type for slickDots
  const firstLoad = useRef<boolean>(true);
  const { desktop }: Breakpoints = useBreakpoints(); // Assuming useBreakpoints returns an object with a desktop property

  useEffect(() => {
    slickDots.current = galleryRef.current?.querySelector('.slick-dots') as HTMLElement | null;
  }, [galleryRef, index]);

  useEffect(() => {
    if (desktop) {
      if (firstLoad.current) {
        firstLoad.current = false;
      } else if (slickDots.current) {
        const containerHeight = slickDots.current.offsetHeight;
        const item = slickDots.current.children[index] as HTMLElement; // Type assertion as HTMLElement
        const itemHeight = item.offsetHeight;
        const length = parseInt((containerHeight / itemHeight).toString());
        const scrollTop = (index + 1 - length / 2) * (itemHeight + 10);
        animate({
          from: slickDots.current.scrollTop,
          to: scrollTop,
          duration: 300,
          func: 'easeInOutQuad',
          callback: (d: number) => {
            if (slickDots.current) {
              slickDots.current.scrollTop = d;
            }
          },
        });
      }
    }
  }, [index, desktop]);

  useEffect(() => {
    if (!desktop) {
      if (firstLoad.current) {
        firstLoad.current = false;
      } else if (slickDots.current) {
        const containerWidth = slickDots.current.offsetWidth;
        const item = slickDots.current.children[index] as HTMLElement; // Type assertion as HTMLElement
        const itemWidth = item.offsetWidth;
        const length = parseInt((containerWidth / itemWidth).toString());
        const scrollLeft = (index + 1 - length / 2) * (itemWidth + 5);
        animate({
          from: slickDots.current.scrollLeft,
          to: scrollLeft,
          duration: 300,
          func: 'easeInOutQuad',
          callback: (d: number) => (slickDots.current!.scrollLeft = d), // Non-null assertion (!) since we're in a conditional check
        });
      }
    }
  }, [index, desktop]);
};
