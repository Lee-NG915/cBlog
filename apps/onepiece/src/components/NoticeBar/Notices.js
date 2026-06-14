import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Swiper from '@castlery/fortress/Swiper';
import Notice from './Notice';
import useIndex from './useIndex';
import useAnimate from './useAnimate';
import style from './style.scss';

export default function Notices({
  notices,
  handlePopup,
  handlePermalink,
  startIndex = 0,
  animateState = notices.length > 1,
  direction = 'bottom',
  speed = 5500,
}) {
  const { current, next, goNext } = useIndex(startIndex > notices.length - 1 ? 0 : startIndex, notices);

  const { ref, animate } = useAnimate(goNext, speed < 4000 ? 4000 : speed);

  useEffect(() => {
    if (ref.current) {
      const idObj = animate();
      return () => {
        clearInterval(idObj.interval);
        clearTimeout(idObj.timmer1);
        clearTimeout(idObj.timmer2);
      };
    }
  }, [animate, ref]);

  if (!animateState) {
    return <Notice notice={notices[0]} handlePopup={handlePopup} handlePermalink={handlePermalink} />;
  }
  if (notices.length > 1) {
    const noticeArr = [];
    notices.forEach((item, index) => {
      noticeArr.push(
        <Notice
          className={`${style.animate}__item`}
          notice={item}
          handlePopup={handlePopup}
          handlePermalink={handlePermalink}
          key={index}
        />
      );
    });
    // eslint-disable-next-line react/no-children-prop
    return <Swiper children={noticeArr} interval={4000} extendWidth={200} direction={`to-${direction}`} />;
  }
  return <Notice notice={notices[0]} handlePopup={handlePopup} handlePermalink={handlePermalink} />;

  // if (notices.length > 1) {
  //   return (
  //     <div className={style.animate}>
  //       {direction === 'bottom' ? (
  //         <div className={`${style.animate}__bottom`}>
  //           <div className={`${style.animate}__placeholder`} ref={ref} />
  //           <Notice
  //             className={`${style.animate}__item`}
  //             notice={notices[next]}
  //             handlePopup={handlePopup}
  //             handlePermalink={handlePermalink}
  //           />
  //           <Notice
  //             className={`${style.animate}__item`}
  //             notice={notices[current]}
  //             handlePermalink={handlePermalink}
  //             handlePopup={handlePopup}
  //           />
  //         </div>
  //       ) : (
  //         <div className={`${style.animate}__top`}>
  //           <Notice
  //             className={`${style.animate}__item`}
  //             notice={notices[current]}
  //             handlePopup={handlePopup}
  //             handlePermalink={handlePermalink}
  //           />
  //           <Notice
  //             className={`${style.animate}__item`}
  //             notice={notices[next]}
  //             handlePermalink={handlePermalink}
  //             handlePopup={handlePopup}
  //           />
  //           <div className={`${style.animate}__placeholder`} ref={ref} />
  //         </div>
  //       )}
  //     </div>
  //   );
  // }
}

Notices.propTypes = {
  notices: PropTypes.array,
  handlePopup: PropTypes.func,
  handlePermalink: PropTypes.func,
  startIndex: PropTypes.number,
  animateState: PropTypes.bool,
  direction: PropTypes.string,
  speed: PropTypes.number,
};
