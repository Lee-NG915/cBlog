import React, { useCallback, useEffect, useRef, useMemo, useState, memo } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { ReviewsListForwardRef } from 'components/Reviews/ReviewsList';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

const ReviewContainer = memo(
  ({
    reviews,
    showRatingAggregation,
    avgRating,
    count,
    totalPage,
    currentPage,
    changePage,
    loading,
    loaded,
    error,
    scrollTop,
  }) => {
    const ref = useRef();
    const view = useRef(1);
    const [currentReviews, setCurrentReviews] = useState(reviews);
    const { desktop } = useBreakpoints();
    const mobile = !desktop;
    useMemo(() => {
      if (loaded && reviews.length) {
        if (mobile) {
          if (currentPage > view.current) {
            view.current += 1;
            setCurrentReviews((last) => [...last, ...reviews]);
          }
        } else {
          setCurrentReviews(reviews);
        }
      }
    }, [loaded, reviews, currentPage]);

    useMemo(() => {
      if (desktop && loaded && currentReviews) {
        if (view.current === 1) {
          view.current += 1;
        } else {
          scrollTop();
        }
      }
    }, [currentReviews, desktop, loaded, scrollTop]);

    const autoLoad = useCallback(() => {
      if (loaded && currentPage < totalPage && document.scrollingElement.scrollTop >= ref.current.offsetHeight - 1800) {
        changePage();
      }
    }, [loaded, currentPage, totalPage, changePage]);

    useEffect(() => {
      if (mobile) {
        const debounceAutoLoad = debounce(autoLoad, 60);
        window.addEventListener('scroll', debounceAutoLoad);
        return () => window.removeEventListener('scroll', debounceAutoLoad);
      }
    }, [autoLoad]);

    return (
      <ReviewsListForwardRef
        reviews={currentReviews}
        showRatingAggregation={showRatingAggregation}
        avgRating={avgRating}
        count={count}
        totalPage={totalPage}
        currentPage={currentPage}
        changePage={changePage}
        loading={loading}
        loaded={loaded}
        error={error}
        ref={ref}
      />
    );
  }
);

ReviewContainer.propTypes = {
  reviews: PropTypes.array,
  showRatingAggregation: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  avgRating: PropTypes.number,
  count: PropTypes.number,
  totalPage: PropTypes.number,
  currentPage: PropTypes.number,
  changePage: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  loaded: PropTypes.bool,
  scrollTop: PropTypes.func,
};

export default ReviewContainer;
