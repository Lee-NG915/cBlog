import React from 'react';
import PropTypes from 'prop-types';
import Review from 'components/Review';
import ReactPaginate from 'react-paginate';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import Rating from 'components/Rating';
import pagStyle from 'sass/pagination.scss';
import SvgIcon from 'components/SvgIcon';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const ReviewsList = ({
  reviews,
  showRatingAggregation,
  avgRating,
  count,
  totalPage,
  currentPage,
  changePage,
  loading,
  error,
  className = '',
}) => {
  const { desktop } = useBreakpoints();
  if (reviews.length > 0 || !desktop) {
    return (
      <div className={className}>
        {showRatingAggregation && (
          <div className={`${style.reviews}__rating`}>
            <Rating rating={avgRating} size={desktop ? 26 : 24} margin={desktop ? 7 : 6} />
            <div className={`${style.reviews}__rating-desc`}>
              {avgRating} <span className={`${style.reviews}__rating-delimiter`}>&nbsp;|&nbsp;</span>
              {count}
              {count > 1 ? ' reviews' : ' review'}
            </div>
          </div>
        )}
        <div className={style.reviews}>
          {reviews.map((review) => (
            <Review className={style.review} key={review.id} review={review} fromReviewPage />
          ))}
          {loading && (
            <div
              className={classNames(`${style.reviews}__loading`, {
                'is-full': !desktop && reviews.length === 0,
              })}
            >
              {!desktop && reviews.length > 0 && <span>l</span>}
              <Spinner />
            </div>
          )}
          {!desktop && !loading && error && <div className={`${style.reviews}__error`}>{error}</div>}
          {!desktop && !loading && !error && currentPage < totalPage && (
            <div className={`${style.reviews}__loadMore`}>
              <button type="button" onClick={() => changePage()} className="btn btn-primary btn-block">
                Load More
              </button>
            </div>
          )}
        </div>
        {desktop && (
          <ReactPaginate
            previousLabel={<SvgIcon name="line-left-arrow" />}
            nextLabel={<SvgIcon name="line-right-arrow" />}
            breakLabel={
              <a className="btn" href="">
                ...
              </a>
            }
            breakClassName="break-me"
            forcePage={currentPage - 1}
            pageCount={totalPage}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={({ selected }) => {
              changePage(selected + 1);
            }}
            containerClassName={pagStyle.pag}
            pageLinkClassName="btn"
            activeClassName="is-active"
            previousClassName={`${pagStyle.pag}__prev`}
            previousLinkClassName="btn"
            nextClassName={`${pagStyle.pag}__next`}
            nextLinkClassName="btn"
          />
        )}
      </div>
    );
  }
  if (loading) {
    return (
      <div className={`${style.reviews}__initializing`}>
        <Spinner />
      </div>
    );
  }
  return null;
};

ReviewsList.propTypes = {
  reviews: PropTypes.array,
  showRatingAggregation: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  avgRating: PropTypes.number,
  count: PropTypes.number,
  totalPage: PropTypes.number,
  currentPage: PropTypes.number,
  changePage: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default ReviewsList;

const ReviewsListForwardRef = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <ReviewsList {...props} />
  </div>
));

export { ReviewsListForwardRef };
