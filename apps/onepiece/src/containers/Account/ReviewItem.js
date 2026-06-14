import React from 'react';
import PropTypes from 'prop-types';
import Messages from 'components/Review/Messages';
import Tag from 'components/Review/Tag';
import { VariantForm } from 'components/ReviewForm';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import { LineItemProductImage, LineItemName, LineItemOptions } from 'components/LineItem';
import { toPrice } from 'utils/number';
import { getBreakpoint } from 'utils/breakpoints';
import Rating from 'components/Rating';
import { formatTime } from 'utils/time';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class ReviewItem extends React.Component {
  static propTypes = {
    review: PropTypes.object.isRequired,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    mode: 'display', // can be 'display' or 'edit'
    review: this.props.review,
    imageProcessing: false,
    item: this.formatItem(this.props.review),
  };

  form = React.createRef();

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.review !== this.props.review) {
      this.setState({
        mode: 'display',
        review: nextProps.review,
        item: this.formatItem(nextProps.review),
      });
    }
  }

  formatItem(review) {
    const lineItem = {
      product_type: review.variant.product_type,
      variant: review.variant,
    };

    if (review.variant.product_type === 'bundle') {
      lineItem.bundle_line_items = review.bundle_options.map((o, index) => ({
        id: index,
        bundle_option: {
          bundle_option_type: o.bundle_option_type,
          name: o.name,
          presentation: o.presentation,
        },
        variant: o.variant,
      }));
    }

    return lineItem;
  }

  switchToEdit() {
    this.setState((state) => ({
      mode: 'edit',
      anonymous: state.review.messages[0] ? state.review.is_anonymous : false,
    }));
  }

  toggleAnonymous() {
    this.setState((state) => ({
      anonymous: !state.anonymous,
    }));
  }

  save() {
    if (!this.state.imageProcessing) {
      this.setState({
        processing: true,
      });
      this.form.current
        .update()
        .then((review) => {
          review.messages = [
            {
              id: review.id,
              title: review.title,
              content: review.content,
              attachments: review.attachments,
              userName: review.user_name,
            },
            ...review.replies,
          ];
          review.status = 'pending';
          this.setState({
            processing: false,
            mode: 'display',
            review,
            item: this.formatItem(review),
          });
        })
        .catch((error) => {
          this.setState({
            processing: false,
          });

          this.context.frame.openModal('response', { body: error });
        });
    }
  }

  cancel() {
    this.setState({
      mode: 'display',
    });
  }

  render() {
    const { mode, anonymous, review, processing, imageProcessing, item } = this.state;
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const message = review.messages[0] || {};

    const isFeatured = review.incentive_type === 'super_rare';

    return (
      <div className={style.reviewItem}>
        <div className={`${style.reviewItem}__main`}>
          <div className={`${style.reviewItem}__item`}>
            <LineItemProductImage
              mediaQuery={!desktop ? '120px' : `(min-width: ${getBreakpoint('xl', 'min')}px) 150px, 120px`}
              imageBg={!desktop ? 'grey' : 'white'}
              className={`${style.reviewItem}__item__image`}
              lineItem={item}
            />
            <div className={`${style.reviewItem}__item__content`}>
              <LineItemName lineItem={item} className={`${style.reviewItem}__item__name`} />
              <LineItemOptions lineItem={item} className={`${style.reviewItem}__item__options`} />
              <div className={`${style.reviewItem}__item__price`}>
                {+item.variant.price !== +item.variant.list_price ? (
                  <div className={`${style.reviewItem}__item__price__sale`}>
                    <span aria-label={`Sale Price: ${toPrice(item.variant.price, true)}`}>
                      {toPrice(item.variant.price, true)}
                    </span>
                    <span aria-label={`Regular Price: ${toPrice(item.variant.list_price, true)}`}>
                      {toPrice(item.variant.list_price, true)}
                    </span>
                  </div>
                ) : (
                  <span aria-label={`Price: ${toPrice(item.variant.price, true)}`}>
                    {toPrice(item.variant.price, true)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {mode === 'display' ? (
            <div className={`${style.reviewItem}__review`}>
              <Rating rating={review.rating} margin={3.5} />
              {review.messages.length > 0 ? (
                <>
                  <Messages className={`${style.reviewItem}__review__message`} review={review} />
                  {isFeatured && <Tag className={`${style.reviewItem}__review__tag`} />}
                </>
              ) : (
                <div className={`${style.reviewItem}__review__message`}>
                  <span>{formatTime(review.updated_at)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`${style.reviewItem}__review`}>
              <VariantForm
                ref={this.form}
                reviewId={review.id}
                anonymous={anonymous}
                rating={review.rating}
                title={message.title}
                content={message.content}
                images={message.attachments}
                onProcessing={(processing) => this.setState({ imageProcessing: processing })}
              />
              <div className={`${style.reviewItem}__review__edit`}>
                <div>
                  <button
                    type="button"
                    className={classNames('btn', { 'is-checked': anonymous })}
                    onClick={this.toggleAnonymous.bind(this)}
                  >
                    Anonymous Review
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    disabled={processing || imageProcessing}
                    onClick={this.cancel.bind(this)}
                    className="btn btn-grey"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={processing || imageProcessing}
                    onClick={this.save.bind(this)}
                    className="btn btn-primary"
                  >
                    Update Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {mode === 'display' && (
          <div className={`${style.reviewItem}__status`}>
            <span
              className={classNames({
                'is-pending': review.status === 'pending',
              })}
            >
              {review.status}
            </span>
            {review.status === 'pending' && (
              <button type="button" onClick={this.switchToEdit.bind(this)} className="btn btn-primary">
                Edit Review
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
