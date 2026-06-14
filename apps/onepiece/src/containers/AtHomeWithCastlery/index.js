import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import { getUrl } from 'pages';
import ReactSVG from 'components/ReactSVG';
import { Link } from 'react-router';
import ApiClient from 'helpers/ApiClient';
import { Container } from '@castlery/fortress';
import Item from './Item';
import Grid from './Grid';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class AtHomeWithCastlery extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  state = {
    hasGridRendered: this.props.location.query.id === undefined,
    // to record reviews loaded by Grid.js
    reviews: [],
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location.query.id === undefined && !this.state.hasGridRendered) {
      this.setState({
        hasGridRendered: true,
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.location.query.id !== this.props.location.query.id;
  }

  componentDidUpdate(prevProps, prevState) {
    // to render review modal
    if (prevState.hasGridRendered && this.props.location.query.id !== undefined) {
      // use setTimeout because this is called in componentDidUpdate, this.container in
      // frame is null still
      const { id } = this.props.location.query;

      if (prevProps.location.query.id === undefined) {
        setTimeout(() => this.showReview(id), 0);
      } else {
        setTimeout(() => {
          this.showReview(id);
          setTimeout(() => this.context.frame.removeModal(2), 100);
        }, 0);
      }
    }

    // to remove review modal
    if (
      prevProps.location.query.id !== undefined &&
      this.props.location.query.id === undefined &&
      prevState.hasGridRendered
    ) {
      setTimeout(() => {
        this.context.frame.removeModal();
      }, 0);
    }
  }

  client = new ApiClient();

  updateReviews(reviews) {
    this.setState({
      reviews,
    });
  }

  setOriginalLikes(originalLikes) {
    this.setState({
      originalLikes,
    });
  }

  showReview(id) {
    const { reviews, originalLikes } = this.state;
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const index = reviews.findIndex((review) => review.id === +id);

    const current = reviews[index];
    let prev;
    let next;
    if (desktop) {
      if (index > 0) {
        prev = reviews[index - 1];
      }
      if (index < reviews.length - 1) {
        next = reviews[index + 1];
      }
    }

    if (!desktop) {
      this.context.frame.addModal(
        <div className={style.modal}>
          <Item detail={current} />
        </div>,
        'bottomUpFade',
        {
          dismiss: () => this.context.router.push(getUrl('at-home-with-castlery')),
          height: 85,
        }
      );
    } else {
      this.context.frame.addModal(
        <div className={`${style.modal}__wrapper`}>
          <div
            className={style.modal}
            onClick={(e) => {
              if (e.target.classList.contains(style.modal)) {
                this.context.router.push(getUrl('at-home-with-castlery'));
              }
            }}
          >
            <div className={`${style.modal}__container`}>
              <Item detail={current} originalLiked={originalLikes.indexOf(current.messages[0].id) > -1} />
            </div>
          </div>
          {prev && (
            <Link
              to={`${getUrl('at-home-with-castlery')}?id=${prev.id}`}
              className={`${style.modal}__btn ${style.modal}__btn--prev btn`}
            >
              <ReactSVG name="arrow-prev" />
            </Link>
          )}
          {next && (
            <Link
              to={`${getUrl('at-home-with-castlery')}?id=${next.id}`}
              className={`${style.modal}__btn ${style.modal}__btn--next btn`}
            >
              <ReactSVG name="arrow-next" />
            </Link>
          )}
        </div>
      );
    }
  }

  render() {
    const { hasGridRendered } = this.state;
    const { location } = this.props;

    return (
      <div>
        {hasGridRendered && (
          <Grid setOriginalLikes={this.setOriginalLikes.bind(this)} updateReviews={this.updateReviews.bind(this)} />
        )}
        {location.query.id !== undefined && !hasGridRendered && (
          <div className={`${style.item}__wrapper`}>
            <Container fixed>
              <Item id={location.query.id} />
            </Container>
          </div>
        )}
      </div>
    );
  }
}
