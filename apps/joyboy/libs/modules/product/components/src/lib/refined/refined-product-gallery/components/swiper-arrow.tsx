'use client';

import { Box, IconButton } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { useEffect, useState } from 'react';

interface SwiperArrowProps {
  onClick: () => void;
  galleryRef: React.RefObject<HTMLDivElement>;
}

export const SwiperArrow = (props: SwiperArrowProps) => {
  const { onClick, galleryRef } = props;
  const [arrowPosition, setArrowPosition] = useState<'container' | 'viewport'>('container');
  const [containerCenter, setContainerCenter] = useState(0);
  const [isContainerVisible, setIsContainerVisible] = useState(true);

  useEffect(() => {
    if (!galleryRef.current) return;

    const updateArrowPosition = () => {
      if (!galleryRef.current) return;

      const containerRect = galleryRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // 检查容器是否完全在视图外
      const isContainerOutOfView =
        containerRect.bottom < 0 ||
        containerRect.top > viewportHeight ||
        containerRect.right < 0 ||
        containerRect.left > viewportWidth;

      const isBottomVisible = containerRect.bottom <= viewportHeight;

      // 计算容器的水平中心位置
      const centerX = containerRect.left + containerRect.width / 2;
      setContainerCenter(centerX);

      setIsContainerVisible(!isContainerOutOfView);

      if (isBottomVisible) {
        setArrowPosition('container');
      } else {
        setArrowPosition('viewport');
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(() => {
          updateArrowPosition();
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );
    updateArrowPosition();

    observer.observe(galleryRef.current);

    window.addEventListener('resize', updateArrowPosition, { passive: true });
    window.addEventListener('scroll', updateArrowPosition, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateArrowPosition);
      window.removeEventListener('scroll', updateArrowPosition);
    };
  }, [galleryRef]);

  if (arrowPosition === 'viewport' && !isContainerVisible) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        position: arrowPosition === 'container' ? 'absolute' : 'fixed',
        left: arrowPosition === 'viewport' ? `${containerCenter}px` : '50%',
        bottom: arrowPosition === 'container' ? theme.spacing(15) : theme.spacing(5),
        transform: 'translateX(-50%)',
        zIndex: 10,
        transition: 'bottom 0.3s ease-in-out, opacity 0.3s ease-in-out',
        opacity: 1,
      })}
    >
      <IconButton
        variant="image"
        aria-label="Next product image"
        title="Next product image"
        sx={{
          '--IconButton-size': '40px',
          rotate: '90deg',
        }}
        onClick={onClick}
      >
        <ArrowRight />
      </IconButton>
    </Box>
  );
};
