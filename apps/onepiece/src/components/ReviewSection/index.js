import React, { useState, useRef, useMemo, useEffect } from 'react';
import Slick from 'react-slick';
import LazyLoad from 'react-lazyload';
import { getUrl } from 'pages';
import { DualBox } from 'components/DualBox';
import Rating from 'components/Rating';
import SvgIcon from 'components/SvgIcon';
import { renderImage } from 'utils/image';
import { Button, GhostArrowBtn } from 'components/Button';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { useDispatch, useSelector } from 'react-redux';
import useThrottle from 'react-use/lib/useThrottle';
import Spinner from 'components/Spinner';

import { enableReviewBtnInHome } from 'config';
import style from './style.scss';

const ReviewSection = () => {
  const marketing = useSelector((state) => state.marketing);
  const {
    title,
    action_text: actionText,
    review_items: reviewItems,
  } = useMemo(
    () => marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/ugc-pgc/review`]?.data?.story?.content || {},
    [marketing]
  );
  const max = useMemo(() => (reviewItems ? reviewItems.length : 0), [reviewItems]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const curReviewIndex = useThrottle(reviewIndex, 500);
  const [loading, setLoading] = useState(true);
  const slickRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/ugc-pgc/review`))
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    slickRef.current?.slickGoTo(curReviewIndex);
  }, [curReviewIndex]);

  if (loading) {
    return (
      <div className={`${style.reviewSection}__loading`}>
        <Spinner />
      </div>
    );
  }
  if (max === 0) {
    return null;
  }
  return (
    <div className={style.reviewSection}>
      <div className={`${style.reviewSection}__header`}>
        <h2>
          {title ||
            `FURNITURE TO WRITE
         HOME ABOUT.`}
        </h2>
      </div>
      <Slick
        ref={slickRef}
        speed={400}
        dots={false}
        arrows={false}
        draggable={false}
        fade
        afterChange={(current) => setReviewIndex(current)}
      >
        {reviewItems.map((review, i) => (
          <DualBox
            key={i}
            leftClassName={`${style.reviewSection}__leftBox`}
            leftComponent={
              <div className={`${style.reviewSection}__content`}>
                <SvgIcon name="quote" />
                <p>{review.content}</p>
                <div>
                  <Rating margin={3.5} rating={+review.rating} />
                  <span className={`${style.reviewSection}__author`}>{`${review.first_name} ${review.last_name}`}</span>
                </div>
              </div>
            }
            rightComponent={
              <div className={`${style.reviewSection}__rightBox`}>
                {renderImage(review.image_url, { ratio: 1 }, 0.3, {
                  alt: review.title || 'review',
                })}
              </div>
            }
          />
        ))}
      </Slick>
      <div className={`${style.reviewSection}__controller`}>
        <div>
          <Button
            color="dark-accent"
            backgroundcolor="transparent"
            hoverStyle={{
              color: 'primary',
            }}
            leftIcon={<SvgIcon name="line-left-arrow" width={26} marginLeft={10} marginRight={20} />}
            onClick={() => {
              setReviewIndex((curReviewIndex - 1 + max) % max);
            }}
          />
          <span>
            {curReviewIndex + 1} / {max}
          </span>
          <Button
            color="dark-accent"
            backgroundcolor="transparent"
            hoverStyle={{
              color: 'primary',
            }}
            leftIcon={<SvgIcon name="line-right-arrow" width={26} marginLeft={20} marginRight={10} />}
            onClick={() => {
              setReviewIndex((curReviewIndex + 1 + max) % max);
            }}
          />
        </div>
      </div>
      <div className={`${style.reviewSection}__viewBtn`}>
        {enableReviewBtnInHome && <GhostArrowBtn text={actionText || 'View All'} href={getUrl('reviews')} />}
      </div>
    </div>
  );
};
const LazyReviewSection = (props) => (
  <LazyLoad offset={200} once height={400}>
    <ReviewSection {...props} />
  </LazyLoad>
);
export default LazyReviewSection;
