import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import { add, remove } from 'redux/modules/wishlist';
import { trackAddToWishList } from 'utils/tracking';

import { EVENT_ADD_TO_WISHLIST } from 'utils/track/constants';
import SvgIcon from 'components/SvgIcon';
import { randomId } from 'utils/number';
import style from './style.scss';

@connect(
  (state) => ({
    wishlist: state.wishlist,
  }),
  {
    add,
    remove,
    trackAddToWishList: (result) => (dispatch) => dispatch({ type: EVENT_ADD_TO_WISHLIST, result }),
  }
)
export default class Like extends Component {
  static propTypes = {
    id: PropTypes.number, // variant_id, if id is not available, show loading
    wishlist: PropTypes.object,
    add: PropTypes.func,
    remove: PropTypes.func,
    trackAddToWishList: PropTypes.func,
    className: PropTypes.string,
    selectItem: PropTypes.element,
    disSelectItem: PropTypes.element,
    showNotification: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    showLoading: false, // whether show loading when adding or removing
  };

  add = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // if the response is within 200ms, don't show the loading animation
    this.timer = setTimeout(() => {
      this.setState({
        showLoading: true,
      });
    }, 200);

    const { add: addWish, id } = this.props;
    const { frame } = this.context;

    addWish(id)
      .then((variant) => {
        clearTimeout(this.timer);
        this.setState({
          showLoading: false,
        });
        const eventId = randomId('AddToWishList');
        trackAddToWishList(variant, { eventId });
        this.props.trackAddToWishList({ variant, eventId });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({
          showLoading: false,
        });
        frame.openModal('response', { body: error });
      });
  };

  remove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // if the response is within 200ms, don't show the loading animation
    this.timer = setTimeout(() => {
      this.setState({
        showLoading: true,
      });
    }, 200);

    const { remove: removeWish, id, showNotification } = this.props;
    const { frame } = this.context;

    removeWish(id)
      .then(() => {
        clearTimeout(this.timer);
        this.setState({
          showLoading: false,
        });
        if (showNotification) {
          showNotification(id);
        }
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({
          showLoading: false,
        });
        frame.openModal('response', { body: error });
      });
  };

  render() {
    const { showLoading } = this.state;
    const { wishlist, className, id, selectItem, disSelectItem } = this.props;

    const isLoadingSeen = wishlist.loading || showLoading || id === undefined;

    const liked = wishlist.data.length > 0 && wishlist.data.findIndex((d) => d.id === id) > -1;

    return (
      <button
        type="button"
        className={classNames('btn', className, style.like, { 'is-loading': isLoadingSeen }, { 'is-liked': liked })}
        disabled={wishlist.loading || wishlist.processing || id === undefined}
        onClick={liked ? this.remove : this.add}
        data-selenium={liked ? 'remove_from_wishlist' : 'add_to_wishlist'}
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isLoadingSeen ? (
          <div className={`${style.like}__loading`}>
            <Spinner small />
          </div>
        ) : liked ? (
          selectItem || <SvgIcon width={22} name="heart" color="primary" label="remove from wishlist" />
        ) : (
          disSelectItem || <SvgIcon width={22} name="heart" label="add to wishlist" />
        )}
      </button>
    );
  }
}
