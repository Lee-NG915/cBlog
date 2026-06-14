'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import useScroll from 'react-use/lib/useScroll';
import useSlider from 'react-use/lib/useSlider';
import { useCallbackRef } from '../hook/useCallbackRef';
import { Box, Stack } from '@castlery/fortress';

let ox = 0;
let startX;

const CustomScrollbar = ({ content, type, hideTrack = false }) => {
  const [scrollRef, scrollRefCallback] = useCallbackRef();
  const [trackRef, trackRefCallback] = useCallbackRef();
  const [indicatorRef, indicatorRefCallback] = useCallbackRef();

  const { x: scrollX } = useScroll(scrollRef);
  const { value: slideRate } = useSlider(trackRef);

  const getScrollLength = () => {
    if (scrollRef.current) {
      return scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    }
    return 0;
  };
  const scrollLength = getScrollLength();

  const trackLength = useMemo(() => {
    if (trackRef.current) {
      const indicatorWidth = indicatorRef.current?.clientWidth || 50;
      return trackRef.current.clientWidth - indicatorWidth;
    }
    return 0;
  }, [trackRef, indicatorRef]);

  const scrollPercent = useMemo(() => {
    if (scrollLength > 0) {
      return scrollX / scrollLength;
    }
    return 0;
  }, [scrollX, scrollLength]);

  const [indicatorTranslateX, setIndicatorTranslateX] = useState(0);
  const initIndicatorMouseX = useRef(0);

  // drag gallery to move
  useEffect(() => {
    if (!scrollRef.current) return;
    const handleMove = (event) => {
      const e = event || window.event;
      scrollRef.current.scrollLeft = ox - e.clientX;
    };
    scrollRef.current.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (scrollRef.current.scrollLeft > 0) {
        ox = e.clientX + scrollRef.current.scrollLeft;
      } else {
        ox = e.clientX;
      }
      startX = e.clientX;
      scrollRef.current.addEventListener('mousemove', handleMove);
    });
    document.addEventListener('mouseup', () => {
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

    const handleMove = (event) => {
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
    if (scrollRef.current) {
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

  return (
    <Stack>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            overflowX: 'scroll',
            whiteSpace: 'nowrap',
            marginBottom: hideTrack ? 0 : '26px',
            paddingBottom: '16px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
          ref={scrollRefCallback}
        >
          {content}
        </Stack>
        {!hideTrack && (
          <Stack
            sx={{
              position: 'absolute',
              left: '15px',
              bottom: '16px',
              cursor: 'pointer',
              height: '9px',
              width: '100%',
              '&::after': {
                content: '""',
                width: '100%',
                position: 'absolute',
                left: 0,
                top: '4px',
                zIndex: 0,
                height: '1px',
                backgroundColor: (theme) => theme.palette.brand.wheat[500],
              },
            }}
            ref={trackRefCallback}
          >
            <Box
              sx={{
                position: 'relative',
                width: '45px',
                height: '100%',
                backgroundColor: (theme) => theme.palette.brand.terracotta[500],
                zIndex: 1,
              }}
              ref={indicatorRefCallback}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default CustomScrollbar;
