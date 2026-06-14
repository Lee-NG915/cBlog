'use client';

import { Box, useBreakpoints } from '@castlery/fortress';
import { useEffect, useRef, type PropsWithChildren } from 'react';

interface PDPStickyColumnProps {
  gridArea: 'left' | 'right';
}

export function PDPStickyColumn({ children, gridArea }: PropsWithChildren<PDPStickyColumnProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const { desktop } = useBreakpoints();
  useEffect(() => {
    const el = ref.current;
    if (!el || !desktop) return;

    function updateTop() {
      if (!el || !desktop) return;
      const top = Math.min(0, window.innerHeight - el.offsetHeight);
      el.style.top = `${top}px`;
    }

    updateTop();

    const ro = new ResizeObserver(updateTop);
    ro.observe(el);
    window.addEventListener('resize', updateTop);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateTop);
    };
  }, [desktop]);

  return (
    <Box
      ref={ref as any}
      sx={{
        '@media (min-width: 901px)': {
          gridArea,
          position: 'sticky',
          alignSelf: 'start',
        },
      }}
    >
      {children}
    </Box>
  );
}
