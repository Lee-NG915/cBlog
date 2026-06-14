'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import useScroll from 'react-use/lib/useScroll';
import useSlider from 'react-use/lib/useSlider';
import { Box, Stack, useBreakpoints } from '@castlery/fortress';
import { BackButton, ForthButton } from './button';

let ox = 0;
let startX: number;

export const scrollTrackClasses = {
  root: 'scroll_track_root',
};

export interface ScrollWrapperProps {
  children: React.ReactNode;
  stepLength?: number;
  hideTrack?: boolean;
  hideDesktopAction?: boolean;
  hideBottomAction?: boolean;
  sx?: any;
  scrollTrackHeight?: number;
  scrollContainerRef?: React.Ref<HTMLDivElement | null>;
}
export const ScrollWrapper = ({
  children,
  hideTrack = false,
  scrollTrackHeight = 48,
  stepLength = 200,
  sx = {},
  hideDesktopAction = true,
  hideBottomAction = true,
  scrollContainerRef,
}: ScrollWrapperProps) => {
  const { desktop = false, tablet } = useBreakpoints();
  const scrollRef = useRef<HTMLDivElement>(null);
  const setScrollRef = (node: HTMLDivElement | null) => {
    scrollRef.current = node;
    if (!scrollContainerRef) {
      return;
    }
    if (typeof scrollContainerRef === 'function') {
      scrollContainerRef(node);
      return;
    }
    scrollContainerRef.current = node;
  };
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { x: scrollX } = useScroll(scrollRef);
  const { value: slideRate } = useSlider(trackRef);
  const [canScroll, setCanScroll] = useState(false);

  const getScrollLength = () => {
    if (scrollRef.current) {
      return scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    }
    return 0;
  };
  const scrollLength = getScrollLength();

  const getTrackLength = () => {
    if (trackRef.current) {
      const indicatorWidth = indicatorRef.current?.clientWidth || 50;
      return trackRef.current.clientWidth - indicatorWidth;
    }
    return 0;
  };
  const trackLength = getTrackLength();

  const scrollPercent = useMemo(() => {
    if (scrollLength > 0) {
      return scrollX / scrollLength;
    }
    return 0;
  }, [scrollX, scrollLength]);

  const [indicatorTranslateX, setIndicatorTranslateX] = useState(0);
  const initIndicatorMouseX = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;

    const checkCanScroll = () => {
      if (!scrollRef.current) return;
      const nextCanScroll = scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
      setCanScroll(nextCanScroll);
      if (!nextCanScroll) {
        setIndicatorTranslateX(0);
      }
    };

    checkCanScroll();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(checkCanScroll);
      resizeObserver.observe(scrollRef.current);
      Array.from(scrollRef.current.children).forEach((child) => {
        resizeObserver?.observe(child as Element);
      });
    }
    window.addEventListener('resize', checkCanScroll);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', checkCanScroll);
    };
  }, [children]);

  // drag gallery to move
  useEffect(() => {
    if (!scrollRef.current) return;
    const handleMove = (event: MouseEvent) => {
      const e = event || window.event;
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = ox - e.clientX;
      }
    };
    scrollRef.current.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!scrollRef.current) return;
      if (scrollRef.current.scrollLeft > 0) {
        ox = e.clientX + scrollRef.current.scrollLeft;
      } else {
        ox = e.clientX;
      }
      startX = e.clientX;
      scrollRef.current.addEventListener('mousemove', handleMove);
    });
    document.addEventListener('mouseup', () => {
      if (!scrollRef.current) return;
      scrollRef.current.removeEventListener('mousemove', handleMove);
    });

    scrollRef.current.addEventListener(
      'click',
      (e) => {
        if (Math.abs(e.clientX - startX) > 1) {
          e.stopPropagation();
        }
      },
      true
    );
  }, [scrollRef]);

  // calc the indicator's translateX
  useEffect(() => {
    if (!indicatorRef.current) return;

    const handleMove = (event: MouseEvent) => {
      const e = event || window.event;
      const trackPosX = trackRef.current?.getBoundingClientRect()?.x || 0;
      const translateX = e.clientX - trackPosX - initIndicatorMouseX.current;

      if (translateX >= 0 && translateX <= trackLength) {
        setIndicatorTranslateX(translateX);
      } else if (translateX < 0) {
        setIndicatorTranslateX(0);
      } else {
        setIndicatorTranslateX(trackLength);
      }
    };
    indicatorRef.current.addEventListener(
      'mousedown',
      (e) => {
        e.preventDefault();
        initIndicatorMouseX.current = e.offsetX;
        document.addEventListener('mousemove', handleMove);
        e.stopPropagation();
      },
      true
    );
    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', handleMove);
      },
      true
    );
  }, [indicatorRef, trackLength, trackRef, indicatorTranslateX]);

  // drag the indicator to move
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style = `transform: translateX(${indicatorTranslateX}px)`;
    }
    if (scrollRef.current && trackLength > 0) {
      const rate = indicatorTranslateX / trackLength;
      scrollRef.current.scrollLeft = rate * scrollLength;
    }
  }, [indicatorRef, indicatorTranslateX, scrollRef, trackLength, scrollLength]);

  // drag track slider to move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = slideRate * scrollLength;
    }
    if (indicatorRef.current) {
      indicatorRef.current.style = `transform: translateX(${slideRate * trackLength}px)`;
    }
  }, [slideRate, scrollRef, indicatorRef, trackLength, scrollLength]);

  // scroll the gallery to move
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style = `transform: translateX(${scrollPercent * trackLength}px)`;
    }
  }, [scrollPercent, indicatorRef, trackLength]);

  const handleBorFStep = (back: boolean) => {
    if (!scrollRef.current) return;
    const scrollEleX = scrollRef?.current?.scrollLeft || 0;
    let nextX = back ? scrollEleX - stepLength : scrollEleX + stepLength;
    if (nextX < 0) {
      nextX = 0;
    }
    if (nextX > scrollLength) {
      nextX = scrollLength;
    }
    scrollRef.current.style = `scroll-behavior: smooth;`;
    scrollRef.current.scrollLeft = nextX;
  };
  const showDesktopAction = canScroll && desktop && !hideDesktopAction;
  const showTrack = canScroll && !hideTrack;
  const showBottomAction = canScroll && !hideBottomAction;
  const showBottomControlRow = showTrack || showBottomAction;

  return (
    <Stack spacing={desktop ? 4 : tablet ? 3 : 2} sx={{ pt: desktop ? 4 : tablet ? 3 : 2, ...sx }}>
      <Stack direction="row" spacing={1}>
        {showDesktopAction && <BackButton onClick={() => handleBorFStep(true)} />}
        <Box
          ref={setScrollRef}
          sx={{
            overflowY: 'hidden',
            overflowX: 'scroll',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {children}
        </Box>
        {showDesktopAction && <ForthButton onClick={() => handleBorFStep(false)} />}
      </Stack>
      {showBottomControlRow ? (
        <Stack direction="row" spacing={1} className={scrollTrackClasses.root}>
          {showTrack ? (
            <Stack height={scrollTrackHeight} sx={{ flex: 1, position: 'relative' }}>
              <Box
                ref={trackRef}
                sx={(theme) => ({
                  width: '100%',
                  height: '4px',
                  background: theme.palette.brand.mono[100],
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  borderRadius: '4px',
                })}
              >
                <Box
                  ref={indicatorRef}
                  sx={(theme) => ({
                    // width: theme.spacing(30),
                    width: desktop ? '240px' : '120px',
                    height: '4px',
                    // background: theme.palette.brand.burntOrange[500],
                    background: theme.palette.brand.terracotta[500],
                    borderRadius: '4px',
                    position: 'absolute',
                    left: 0,
                    cursor: 'pointer',
                  })}
                />
              </Box>
            </Stack>
          ) : null}
          <>
            {!hideBottomAction && (
              <>
                <BackButton onClick={() => handleBorFStep(true)} />
                <ForthButton onClick={() => handleBorFStep(false)} />
              </>
            )}
          </>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ScrollWrapper;
