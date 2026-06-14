'use client';
import { Box, Stack, IconButton, useBreakpoints } from '@castlery/fortress';
import { ArrowForward, ArrowBack } from '@castlery/fortress/Icons';
import { useRef, useState, useEffect } from 'react';
import { useWindowSize } from 'react-use';

export const horizontalScrollBoxClasses = {
  root: 'horizontal-scroll-box',
  container: 'horizontal-scroll-box-container',
  'prev-icon': 'horizontal-scroll-box-prev-icon',
  'next-icon': 'horizontal-scroll-box-next-icon',
};
interface HorizontalScrollBoxProps {
  children: React.ReactNode;
  /**
   * The forward/backward distance of each button click
   * @default 700
   */
  stepLength?: number;
}
export function HorizontalScrollBox({ children, stepLength = 0 }: HorizontalScrollBoxProps) {
  const { desktop, tablet } = useBreakpoints();

  const { width } = useWindowSize();
  const [backDisabled, setBackDisabled] = useState(true);
  const [forwardDisabled, setForwardDisabled] = useState(false);

  const defaultStepLength = desktop ? width - 32 * 2 - 100 : tablet ? width - 24 * 2 : width - 16 * 2;
  const usedStepLength = stepLength || defaultStepLength;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'back' | 'forward') => {
    if (!containerRef.current) return;
    const { scrollWidth, clientWidth } = containerRef.current;
    const isScrollable = scrollWidth > clientWidth;

    if (!isScrollable) return;
    if (direction === 'back') {
      const num = containerRef.current.scrollLeft - usedStepLength;

      if (num < 0) {
        setBackDisabled(true);
      } else {
        setBackDisabled(false);
      }
      containerRef.current.scrollTo({
        left: containerRef.current.scrollLeft - usedStepLength,
        behavior: 'smooth',
      });
      setForwardDisabled(false);
    } else {
      const num = containerRef.current.scrollLeft + usedStepLength;

      if (num > scrollWidth - clientWidth) {
        setForwardDisabled(true);
      } else {
        setForwardDisabled(false);
      }
      containerRef.current.scrollTo({
        left: containerRef.current.scrollLeft + usedStepLength,
        behavior: 'smooth',
      });
      setBackDisabled(false);
    }
  };

  return (
    <Box
      className={horizontalScrollBoxClasses.root}
      sx={{
        width: '100%',
        position: 'relative',
        zIndex: 0,
      }}
    >
      <IconButton
        disabled={backDisabled}
        className={horizontalScrollBoxClasses['prev-icon']}
        onClick={() => handleScroll('back')}
        sx={{
          width: 56,
          height: 56,
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          margin: 'auto',
          zIndex: 99,
          borderRadius: 60,
          // boxShadow: (theme) => theme.shadow.floating.lg, // /* floating/lg-floating */
          boxShadow: (theme) => theme.shadow.sm,
          bgcolor: (theme) => theme.palette.brand.warmLinen[500],
          cursor: backDisabled ? 'not-allowed' : 'pointer',
          '&:hover': {
            bgcolor: (theme) => theme.palette.brand.warmLinen[500],
          },
        }}
      >
        <ArrowBack sx={{ color: (theme) => theme.palette.text.icon }} />
      </IconButton>

      <Stack
        ref={containerRef}
        className={horizontalScrollBoxClasses.container}
        direction="row"
        sx={{
          width: '100%',
          flexFlow: 'row nowrap',
          minHeight: 300,
          overflow: 'hidden',
          overflowX: 'scroll',
          scrollBehavior: 'smooth',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {children}
      </Stack>
      <IconButton
        disabled={forwardDisabled}
        className={horizontalScrollBoxClasses['next-icon']}
        onClick={() => handleScroll('forward')}
        sx={{
          width: 56,
          height: 56,
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          margin: 'auto',
          zIndex: 99,
          borderRadius: 60,
          // boxShadow: (theme) => theme.shadow.floating.lg, // /* floating/lg-floating */
          boxShadow: (theme) => theme.shadow.sm,
          bgcolor: (theme) => theme.palette.brand.warmLinen[500],
          scrollBehavior: 'smooth',
          transition: 'all 0.3s ease-in-out',
          cursor: forwardDisabled ? 'not-allowed' : 'pointer',
          '&:hover': {
            bgcolor: (theme) => theme.palette.brand.warmLinen[500],
          },
        }}
      >
        <ArrowForward sx={{ color: (theme) => theme.palette.text.icon }} />
      </IconButton>
    </Box>
  );
}

export default HorizontalScrollBox;
