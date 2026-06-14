import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Like from 'components/Like';
import Tag from 'components/Tag';
import Rating from 'components/Rating';
import SvgIcon from 'components/SvgIcon';
import { ColorPalette } from 'utils/color';
import { useSelector } from 'react-redux';
import { selectCurrentProductName } from 'redux/modules/products';
import Price from './ProductPrice';
import { useCurrentVariant } from '../hooks/product';

import style from './style.scss';
import ProductTCC from './ProductTCC';

const ProductHead = ({ scrollToReview, className = '', discontinued, reviewsSummary }) => {
  const productName = useSelector(selectCurrentProductName);
  const variant = useCurrentVariant();

  // const { avg_rating: avgRating, count: reviewCount } = product.reviews;
  return (
    <div className={classNames(`${style.summary}`, className)}>
      <div className={`${style.summary}__nameBlock`}>
        {productName && (
          <div className={`${style.summary}__nameBlock-name`}>
            <h1>{productName}</h1>
            {variant ? <Tag tags={variant?.badges} size="small" /> : null}
          </div>
        )}
        {!discontinued && (
          <Like
            id={variant.id}
            className={`${style.summary}__nameBlock-like`}
            selectItem={<SvgIcon color="primary" name="heart" label="Remove from wishlist" />}
            disSelectItem={<SvgIcon name="heart-outline" label="Add to wishlist" />}
          />
        )}
      </div>
      {reviewsSummary && reviewsSummary.average_rating >= 3 && (
        <div className={`${style.summary}__rating`}>
          <Rating
            rating={reviewsSummary.average_rating}
            margin={1}
            size={14}
            className={`${style.summary}__rating-star`}
            innerType="outline"
            innerColor={ColorPalette.primary}
            outerColor={ColorPalette.primary}
          />
          <a
            role="button"
            className={`${style.summary}__rating-count`}
            onClick={scrollToReview}
            data-selenium="x_reviews"
          >
            {reviewsSummary.total_count} {reviewsSummary.total_count > 1 ? 'Reviews' : 'Review'}
          </a>
        </div>
      )}

      {/* {avgRating >= 3 && (
        <div className={`${style.summary}__rating`}>
          <Rating
            rating={avgRating}
            margin={1}
            size={14}
            className={`${style.summary}__rating-star`}
            innerType="outline"
            innerColor={ColorPalette.primary}
            outerColor={ColorPalette.primary}
          />
          <a
            role="button"
            className={`${style.summary}__rating-count`}
            onClick={scrollToReview}
            data-selenium="x_reviews"
          >
            {reviewCount} {reviewCount > 1 ? 'Reviews' : 'Review'}
          </a>
        </div>
      )} */}

      {/* Price block inlcuding instalment and zip */}
      <Price className={`${style.summary}__price`} mode="standard" />
    </div>
  );
};

ProductHead.propTypes = {
  scrollToReview: PropTypes.func,
  className: PropTypes.string,
  discontinued: PropTypes.bool,
  reviewsSummary: PropTypes.object,
};

export default ProductHead;
