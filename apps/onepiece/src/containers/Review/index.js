import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import PageHeader from 'components/PageHeader';
import Helmet from 'react-helmet';
import { asyncLoad } from 'components/AsyncLoad/utils';
import PropTypes from 'prop-types';
import lang from 'utils/lang';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import { loadIfNeeded as loadReview } from 'redux/modules/reviews';
import { FrameContext } from 'containers/Frame/FrameContext';
import { withNamedSelectContext } from 'utils/contextUtils';
import { cloudinaryRoot, enableReviewMainIntro, globalFeatureInSG } from 'config';
import { Container } from '@castlery/fortress';
import { getUserDevice } from 'utils/device';
import ReviewContainer from './ReviewContainer';
import style from './style.scss';

const device = getUserDevice();

const mobileBannerImage = `${cloudinaryRoot}/static/review/review-banner-mobile.jpg`;
const desktopBannerImage = `${cloudinaryRoot}/static/review/review-banner-v2.jpg`;

@asyncLoad([
  ({
    store: { dispatch },
    location: {
      query: { p },
    },
  }) => (device !== 'desktop' ? dispatch(loadReview(1)) : dispatch(loadReview(p || 1))),
])
@connect(
  (state) => ({
    reviews: state.reviews,
    lastLoadPage: +state.reviews.lastLoadPage,
  }),
  { loadReview }
)
@wrapPage()
@withNamedSelectContext(FrameContext, 'frame')
@withUseBreakpoints
class Reviews extends Component {
  static propTypes = {
    reviews: PropTypes.object,
    lastLoadPage: PropTypes.number,
    router: PropTypes.object,
    location: PropTypes.object,
    loadReview: PropTypes.func,
    frame: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  list = createRef();

  constructor(props) {
    super(props);
    const { reviews, lastLoadPage } = props;
    this.state = {
      avgRating: reviews[lastLoadPage].data.average_rating,
      totalPages: reviews[lastLoadPage].data.total_pages,
      count: reviews[lastLoadPage].data.count,
    };
  }

  componentDidMount() {
    const { totalPages } = this.state;
    const { router, location } = this.props;
    if (this.getCurrentPageReviewsData().length === 0) {
      router.push({
        ...location,
        query: { p: totalPages },
      });
      this.setState((last) => ({ ...last, currentPage: last.totalPages }));
    }
  }

  changePage = (page) => {
    const {
      lastLoadPage,
      loadReview,
      router,
      location,
      breakpoints: { desktop },
    } = this.props;
    let newPage = page;
    if (page === undefined) {
      newPage = +lastLoadPage + 1;
    }
    if (!desktop) {
      loadReview(newPage);
    } else {
      router.push({ ...location, query: { p: newPage } });
    }
  };

  scrollToTop = () => {
    const { frame } = this.props;
    if (this.list.current) {
      frame.scrollToTop(true, this.list.current.offsetTop - 10);
    }
  };

  getCurrentPageReviews = () => {
    const { reviews, lastLoadPage } = this.props;
    return reviews[lastLoadPage] || {};
  };

  getCurrentPageLoadStatus = () => {
    const { loading = true, loaded = false } = this.getCurrentPageReviews();
    return { loading, loaded };
  };

  getCurrentPageReviewsData = () => {
    const { results = [] } = this.getCurrentPageReviews().data || {};
    return results;
  };

  getCurrentPageReviewsError = () => {
    const error = this.getCurrentPageReviews().error || '';
    return error;
  };

  render() {
    const { lastLoadPage } = this.props;
    const { avgRating, count, totalPages } = this.state;
    const { loading, loaded } = this.getCurrentPageLoadStatus();
    const currentReviews = this.getCurrentPageReviewsData();
    const error = this.getCurrentPageReviewsError();
    const showRatingAggregation = avgRating && count;
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
        review: currentReviews.map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: `${review.user_name || ''}`.trim() || 'Castlery Customer',
          },
          datePublished: review.updated_at,
          itemReviewed: {
            name: review.variant.name,
          },
          reviewBody: review.content,
          reviewRating: {
            '@type': 'Rating',
            bestRating: '5',
            ratingValue: review.rating_product,
            worstRating: '1',
          },
        })),
      };
    }
    return (
      <div className={style.reviews}>
        {jsonLd && (
          <Helmet>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
          </Helmet>
        )}
        <Container>
          <PageHeader
            className={`${style.reviews}__banner`}
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: mobileBannerImage,
                loader: {
                  ratio: 0.8133,
                },
              },
              {
                breakpoint: 'lg',
                srcset: desktopBannerImage,
                loader: {
                  ratio: 0.3125,
                },
              },
            ]}
            title="Why Customer Love Us"
            lazy={false}
            setImagePreloaderOnServer
            mainTitle="Customer Reviews"
            mainIntro={enableReviewMainIntro ? `Over ${globalFeatureInSG ? '20,000' : '15,000'} happy customers` : ''}
            subTitle="Real customers. Genuine feedback."
            subIntro="See why fellow shoppers trust and love our products."
            showMask
          />

          <Container maxWidth="md" className={`${style.reviews}__list`} ref={this.list}>
            <ReviewContainer
              reviews={currentReviews}
              showRatingAggregation={showRatingAggregation}
              avgRating={avgRating}
              count={count}
              totalPage={totalPages}
              currentPage={lastLoadPage}
              changePage={this.changePage}
              loading={loading}
              loaded={loaded}
              error={error}
              scrollTop={this.scrollToTop}
            />
          </Container>
        </Container>
      </div>
    );
  }
}
export default Reviews;
