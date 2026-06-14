import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Review from 'components/Review';
import ApiClient from 'helpers/ApiClient';
import ReactPaginate from 'react-paginate';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import Rating from 'components/Rating';
import lang from 'utils/lang';
import { withUseBreakpoints } from 'utils/page';

import style from './style.scss';

@withUseBreakpoints
export default class Reviews extends React.Component {
  static propTypes = {
    productId: PropTypes.number,
    scrollTop: PropTypes.func,
    className: PropTypes.string,
    reviewsPerPage: PropTypes.number,
    fromReviewPage: PropTypes.bool,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    reviewsPerPage: 10,
    fromReviewPage: false,
  };

  client = new ApiClient();

  state = {
    reviews: [],

    reloaded: false, //  pagination has happened
    loading: true,
    error: '',

    page: 1,
    totalPage: Infinity,
  };

  componentDidMount() {
    this._isMounted = true;
    this.loadReviews();
  }

  componentDidUpdate(prevProps) {
    const { productId } = this.props;
    if (prevProps.productId !== productId) {
      this.loadReviews();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // is _page is not passed, treat it as an initial loading
  loadReviews = (_page) => {
    const { reviews } = this.state;
    const { frame } = this.context;
    const { productId, scrollTop, reviewsPerPage, fromReviewPage, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    this.setState({
      loading: true,
    });

    let loadReviewsPromise;
    if (fromReviewPage) {
      loadReviewsPromise = this.client.get('/reviews/all', {
        params: {
          page: _page || 1,
          per_page: reviewsPerPage,
        },
      });
    } else {
      loadReviewsPromise = this.client.get('/reviews', {
        params: {
          product_id: productId,
          page: _page || 1,
          per_page: reviewsPerPage,
        },
      });
    }
    loadReviewsPromise
      .then((result) => {
        if (!this._isMounted) {
          return;
        }

        const newReviews = !desktop ? [...reviews, ...result.results] : result.results;
        this.setState({
          loading: false,
          reviews: newReviews,
          page: result.current_page,
          totalPage: result.total_pages,
          avgRating: result.avg_rating,
          count: result.count,
          error: '',
          reloaded: _page !== undefined,
        });

        // scroll to review
        if (desktop && _page !== undefined && scrollTop) {
          scrollTop();
        }
      })
      .catch((error) => {
        if (!this._isMounted) {
          return;
        }

        if (!error) {
          frame.openModal('response');
          return;
        }

        this.setState({
          loading: false,
          reloaded: _page !== undefined,
          reviews: _page === undefined ? [] : reviews,
          error: error.errors && error.errors[0].detail,
        });

        if (_page !== undefined && desktop) {
          frame.openModal('response', { body: error });
        }
      });
  };

  handlePageClick = (data) => {
    this.loadReviews(data.selected + 1);
  };

  loadMore = () => {
    const { page } = this.state;
    this.loadReviews(page + 1);
  };

  render() {
    const { reviews, page, totalPage, reloaded, loading, error, avgRating, count } = this.state;
    const { className, fromReviewPage, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const showRatingAggregation = avgRating && count && fromReviewPage;
    let jsonLd = null;
    if (showRatingAggregation) {
      jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'Organization',
        name: 'Castlery Furniture',
        url: __BASE_URL__,
        telephone: lang.t('common.telephone.value'),
        whatsapp: lang.t('common.whatsapp.value'),
        email: lang.t('common.support_email'),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating,
          worstRating: 1,
          bestRating: 5,
          reviewCount: count,
        },
        review: reviews.map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name:
              `${review.messages[0]?.user?.firstname || ''} ${review.messages[0]?.user?.lastname || ''}`.trim() ||
              'Castlery Customer',
          },
          datePublished: review.updated_at,
          itemReviewed: {
            name: review.variant.name,
          },
          reviewBody: review.messages[0].content,
          reviewRating: {
            '@type': 'Rating',
            bestRating: '5',
            ratingValue: review.rating_product,
            worstRating: '1',
          },
        })),
      };
    }

    if (reloaded || reviews.length > 0 || !desktop) {
      return (
        <div className={className}>
          {jsonLd && (
            <Helmet>
              <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>
          )}
          {showRatingAggregation && (
            <div className={`${style.reviews}__rating`}>
              <Rating rating={avgRating} size={desktop ? 26 : 24} margin={desktop ? 7 : 6} />
              <div className={`${style.reviews}__rating-desc`}>
                {avgRating} <span className={`${style.reviews}__rating-delimiter`}>&nbsp;|&nbsp;</span> {count}{' '}
                {count > 1 ? 'reviews' : 'review'}
              </div>
            </div>
          )}
          <div className={style.reviews}>
            {reviews.map((review) => (
              <Review className={style.review} key={review.id} review={review} fromReviewPage={fromReviewPage} />
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
            {!desktop && !loading && !error && page < totalPage && (
              <div className={`${style.reviews}__loadMore`}>
                <button type="button" onClick={this.loadMore.bind(this)} className="btn btn-primary btn-block">
                  Load More
                </button>
              </div>
            )}
          </div>
          {desktop && totalPage > 1 && (
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel={
                <a className="btn" href="">
                  ...
                </a>
              }
              breakClassName="break-me"
              forcePage={page - 1}
              pageCount={totalPage}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={this.handlePageClick}
              containerClassName={style.pagi}
              pageLinkClassName="btn"
              activeClassName="is-active"
              previousClassName={`${style.pagi}__prev`}
              previousLinkClassName="btn"
              nextClassName={`${style.pagi}__next`}
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
  }
}
