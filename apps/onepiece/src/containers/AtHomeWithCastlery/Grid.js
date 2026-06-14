import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import { loadIfNeeded as loadMessageVotes } from 'redux/modules/messageVotes';
import { connect } from 'react-redux';
import { Container } from '@castlery/fortress';
import { getUserDevice } from 'utils/device';
import { withUseBreakpoints } from 'utils/page';
import GridItem from './GridItem';
import style from './style.scss';

const device = getUserDevice();
@connect(null, { loadMessageVotes })
@withUseBreakpoints
export default class Review extends React.Component {
  static propTypes = {
    updateReviews: PropTypes.func.isRequired,
    loadMessageVotes: PropTypes.func.isRequired,
    setOriginalLikes: PropTypes.func.isRequired,
    breakpoints: PropTypes.object,
  };

  state = {
    loading: true,
    error: '',
    reviews: [],
    page: 1,
    perPage: device !== 'desktop' ? 20 : 30,
    totalPage: Infinity,
  };

  componentDidMount() {
    const {
      breakpoints: { desktop },
    } = this.props;
    this.loadReviews({
      initial: true,
    });
    this.setState({ perPage: !desktop ? 20 : 30 });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      breakpoints: { desktop },
    } = this.props;
    this.setState({ perPage: !desktop ? 20 : 30 });
    if (prevState.reviews !== this.state.reviews) {
      if (!this.msnry) {
        const Masonry = require('masonry-layout');
        this.msnry = new Masonry(this.grid, {
          itemSelector: `.${style.grid}__item`,
          columnWidth: `.${style.grid}__sizer`,
          percentPosition: true,
          transitionDuration: 0,
        });
      } else {
        this.msnry.appended(this.items.slice(prevState.reviews.length));
      }
    }
  }

  componentWillUnmount() {
    if (this.msnry) {
      this.msnry.destroy();
    }
  }

  client = new ApiClient();

  // init for item ref
  items = [];

  loadReviews(options) {
    const { page, perPage } = this.state;
    const { loadMessageVotes } = this.props;

    this.setState({
      loading: true,
    });

    let request = this.client.get('/reviews', {
      params: {
        page: options.page || page,
        per_page: perPage,
      },
    });

    if (options.initial) {
      request = Promise.all([request, loadMessageVotes()]).then((results) => {
        this.props.setOriginalLikes(results[1]);
        return results[0];
      });
    }

    request
      .then((reviews) => {
        // eslint-disable-next-line react/no-access-state-in-setstate
        const newReviews = [...this.state.reviews, ...reviews.results];
        this.setState({
          loading: false,
          page: reviews.current_page,
          totalPage: reviews.total_pages,
          reviews: newReviews,
        });
        this.props.updateReviews(newReviews);
      })
      .catch((error) =>
        this.setState({
          loading: false,
          error: error.errors ? error.errors[0].detail : error,
        })
      );
  }

  render() {
    const { reviews, loading, error, page, totalPage } = this.state;

    return (
      <div className={style.wrapper}>
        <Container fixed>
          <h1>At home with Castlery</h1>
          <h2>Discover real homes, with real people, for genuine inspiration.</h2>
          <div className={style.grid} ref={(c) => (this.grid = c)}>
            <div className={`${style.grid}__sizer`} />
            {reviews.length > 0 &&
              reviews.map((review, index) => (
                <div key={index} ref={(c) => (this.items[index] = c)} className={`${style.grid}__item`}>
                  <GridItem review={review} />
                </div>
              ))}
          </div>
          {loading && (
            <div
              className={classNames(`${style.grid}__loading`, {
                'is-fullpage': reviews.length === 0,
              })}
            >
              <Spinner />
            </div>
          )}
          {!loading &&
            (error ? (
              <div className={`${style.grid}__error`}>{error}</div>
            ) : page < totalPage ? (
              <div className={`${style.grid}__loadMore`}>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      this.loadReviews({
                        page: page + 1,
                      })
                    }
                    className="btn btn-primary"
                  >
                    Load More
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${style.grid}__end`}>
                <span>End of reviews</span>
              </div>
            ))}
        </Container>
      </div>
    );
  }
}
