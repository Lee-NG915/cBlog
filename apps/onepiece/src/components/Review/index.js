import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Rating from 'components/Rating';
import ReactSVG from 'components/ReactSVG';
import { getVariantLink } from 'utils/link';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import Tooltip from 'components/Tooltip';
import Tag from './Tag';
import Messages from './Messages';

import style from './style.scss';

export default class Review extends Component {
  static propTypes = {
    review: PropTypes.object.isRequired,
    className: PropTypes.string,
    fromReviewPage: PropTypes.bool,
  };

  render() {
    const { review, className, fromReviewPage } = this.props;

    const user = (
      <div
        className={classNames(`${style.review}__author`, {
          'is-featured': review.incentive_type === 'super_rare',
        })}
      >
        <span>{review.user_name.trim() || 'Castlery Customer'}</span>
        <Tooltip title="Verified Customer" placement="bottom">
          <div className={`${style.review}__tip`}>
            <ReactSVG name="check-circle-thick" />
          </div>
        </Tooltip>
      </div>
    );

    const rating = <Rating rating={review.rating} className={`${style.review}__rating`} margin={3.5} />;

    return (
      <div className={classNames(style.review, className)} ref={(c) => (this.container = c)}>
        <div className={`${style.review}__left`}>
          {user}
          {rating}
          {fromReviewPage && review.variant.images[0] && review?.variant?.is_available && (
            <Link to={getVariantLink(review.variant)} aria-label={`Link to ${review.variant.product_name}`}>
              <div className={`${style.review}__image`}>
                <ReactPicture
                  srcset={review.variant.images[0].links}
                  alt={review.variant.name}
                  loader={{
                    ratio: 0.667,
                  }}
                />
              </div>
            </Link>
          )}
          {fromReviewPage && review.variant.images[0] && !review?.variant?.is_available && (
            <div className={`${style.review}__image`}>
              <ReactPicture
                srcset={review.variant.images[0].links}
                alt={review.variant.name}
                loader={{
                  ratio: 0.667,
                }}
              />
            </div>
          )}
          <div className={`${style.review}__product`}>
            {/* <p>{review.variant.name}</p> */}
            {/* {!fromReviewPage && review.is_related && (
              <div className={`${style.review}__related`}>Review on similar product:</div>
            )} */}
            {fromReviewPage && review?.variant?.is_available ? (
              <p>
                <Link to={getVariantLink(review.variant)}>{review.variant.product_name}</Link>
              </p>
            ) : (
              <p>{review.variant.product_name}</p>
            )}
            {review.variant.variant_option_values.map((v, index) => (
              <p key={index}>
                {v.option_type_presentation}: {v.presentation}
              </p>
            ))}
            {/* {review.variant.product_type === 'bundle'
              ? review.bundle_options.map((o) => {
                  if (o.bundle_option_type !== 'simple') {
                    return (
                      <p key={o.id}>
                        {o.presentation}: {o.variant.variant_option_values[0].presentation}
                      </p>
                    );
                  }
                  return null;
                })
              : review.variant.variant_option_values.map((o, index) => (
                  <p key={index}>
                    {o.option_type_presentation}: {o.presentation}
                  </p>
                ))} */}
          </div>
          {review.incentive_type === 'super_rare' && <Tag className={`${style.review}__featured`} />}
        </div>
        <div className={`${style.review}__right`}>
          <Messages review={review} />
        </div>
      </div>
    );
  }
}
