import React, { useState, useRef, useMemo, useEffect } from 'react';
import useScroll from 'react-use/lib/useScroll';
import useSlider from 'react-use/lib/useSlider';
import useWindowSize from 'react-use/lib/useWindowSize';
import PropTypes from 'prop-types';
import SocialImage from 'components/SocialImage/v2';
import { useBreakpoints } from '@castlery/fortress/hooks';

import SvgIcon from 'components/SvgIcon';
import { useCallbackRef } from 'utils/hooks';
import style from '../style.scss';

let ox = 0;
let startX;

const SocialSection = ({ posts }) => {
  const [scrollRef, scrollRefCallback] = useCallbackRef();
  const [trackRef, trackRefCallback] = useCallbackRef();
  const [indicatorRef, indicatorRefCallback] = useCallbackRef();

  const { desktop } = useBreakpoints();

  const { width: widowWidth } = useWindowSize();
  const { x: scrollX } = useScroll(scrollRef);
  const { value: slideRate } = useSlider(trackRef);
  const scrollLength = useMemo(() => {
    if (scrollRef.current) {
      return scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    }
    return 0;
  }, [scrollRef, widowWidth]);
  const trackLength = useMemo(() => {
    if (trackRef.current) {
      return trackRef.current.clientWidth - 50;
    }
    return 0;
  }, [trackRef, widowWidth]);
  const trackPosX = useMemo(() => trackRef.current?.getBoundingClientRect()?.x || 0, [trackRef, widowWidth]);
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
  }, [indicatorRef, trackLength, trackPosX, indicatorTranslateX]);

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
    <div className={`${style.social}`}>
      <div className={`${style.social}__introduce`}>
        <div className={`${style.social}__decorator`}>
          <h2>Edits</h2>
          <div className={`${style.social}__icon`}>
            <SvgIcon name="instagram" color="dark-neutral" width="15" height="15" />
            <span>
              <a target="_blank" href={`https://www.instagram.com/castlery${__COUNTRY__?.toLowerCase()}/?hl=en`}>
                castlery{__COUNTRY__?.toLowerCase()}
              </a>
            </span>
          </div>
        </div>
        <h2>Room</h2>
        <p>
          Meet the room edits: real life shots of our furniture in action. (We like to think we style our furniture
          well, but we can’t help but show off how you do it.)
        </p>
      </div>
      <div className={`${style.social}__galleryWrapper`}>
        <div className={`${style.social}__gallery`} ref={scrollRefCallback}>
          {posts &&
            posts.map((post, index) => (
              <SocialImage
                targetPosts={posts}
                key={post._uid}
                post={post}
                collection="homepage"
                width={0.3}
                draggable="false"
                listPosition={index + 1}
                showSlideArrows={desktop}
              />
            ))}
        </div>
        <div className={`${style.social}__track`} ref={trackRefCallback}>
          <div className={`${style.social}__indicator`} ref={indicatorRefCallback} />
        </div>
      </div>
    </div>
  );
};

SocialSection.propTypes = {
  posts: PropTypes.array,
};
SocialSection.defaultProps = {
  posts: [],
};
export default SocialSection;
