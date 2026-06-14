import React, { useState, useRef, useMemo, useEffect } from 'react';
import useScroll from 'react-use/lib/useScroll';
import useSlider from 'react-use/lib/useSlider';
import useWindowSize from 'react-use/lib/useWindowSize';
import PropTypes from 'prop-types';
import { useCallbackRef } from 'utils/hooks';
import classNames from 'classnames';
import style from './style.scss';

let ox = 0;
let startX;

const CustomScrollbar = ({ content, type, hideTrack = false }) => {
  const [scrollRef, scrollRefCallback] = useCallbackRef();
  const [trackRef, trackRefCallback] = useCallbackRef();
  const [indicatorRef, indicatorRefCallback] = useCallbackRef();

  const { width: widowWidth } = useWindowSize();
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
  }, [trackRef, widowWidth]);

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
    <div
      className={classNames(`${style.scrollbar}`, {
        'is-storyblok': type === 'storyblok',
      })}
    >
      <div className={`${style.scrollbar}__galleryWrapper`}>
        <div
          className={classNames(`${style.scrollbar}__gallery`, {
            'no-track': !!hideTrack,
          })}
          ref={scrollRefCallback}
        >
          {content}
        </div>
        {!hideTrack && (
          <div className={`${style.scrollbar}__track`} ref={trackRefCallback}>
            <div className={`${style.scrollbar}__indicator`} ref={indicatorRefCallback} />
          </div>
        )}
      </div>
    </div>
  );
};

CustomScrollbar.propTypes = {
  content: PropTypes.element,
  type: PropTypes.string,
  hideTrack: PropTypes.bool,
};

export default CustomScrollbar;
