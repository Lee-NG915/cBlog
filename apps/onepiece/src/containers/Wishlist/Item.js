import React, { useContext } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import { toPrice } from 'utils/number';
import Like from 'components/Like';
import { add } from 'redux/modules/cart';
import { useDispatch, useSelector } from 'react-redux';
import Tag from 'components/Tag';
import { getVariantLink } from 'utils/link';
import { GhostArrowBtn } from 'components/Button';
import { FrameContext } from 'containers/Frame/FrameContext';
import { add as addToWishlist } from 'redux/modules/wishlist';
import PropTypes from 'prop-types';
import style from './style.scss';

const Item = ({ className, variant, lazy, setShowNotification, setNotificationData }) => {
  const link = getVariantLink(variant) || '/';
  const cart = useSelector((state) => state.cart);
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const addToCart = () => {
    const quantity = variant.min_sale_qty;
    dispatch(
      add({
        variant,
        quantity,
        page: 'Wishlist',
      })
    )
      .then(() => frame.openModal('cart'))
      .catch((error) => frame.openModal('response', { body: error }));
  };
  return (
    <div className={classNames(style.item, className)}>
      <Link to={link} className={`${style.item}__image`}>
        {variant.images.length > 0 ? (
          <ReactPicture
            srcset={variant.images[0].links}
            alt={variant.product_name}
            loader={{ ratio: 0.66, sizes: ['0.25-xsl', '0.34-xl', '0.5-sm'] }}
            lazy={lazy}
          />
        ) : (
          <ReactPicture alt={variant.product_name} loader={{ ratio: 0.66 }} />
        )}
      </Link>
      <Link to={link} className={`${style.item}__name`}>
        {variant.product_name}
        <Tag tags={variant?.badges || []} />
      </Link>
      <p className={`${style.item}__options`}>
        {variant.product_type === 'bundle'
          ? variant.product_layout !== 'bundle_overlay'
            ? variant.product_bundle_options.map((option) => option.option_product_name).join(', ')
            : 'More Customizations'
          : variant.variant_option_values.map((option) => option.presentation).join(', ')}
      </p>
      <div className={`${style.item}__price`}>
        {+variant.price !== +variant.list_price ? (
          <div className={`${style.item}__price__sale`}>
            <span aria-label={`Sale Price: ${toPrice(variant.price, true)}`}>{toPrice(variant.price, true)}</span>
            <span aria-label={`Regular Price: ${toPrice(variant.list_price, true)}`}>
              {toPrice(variant.list_price, true)}
            </span>
          </div>
        ) : (
          <span aria-label={`Price: ${toPrice(variant.price, true)}`}>{toPrice(variant.price, true)}</span>
        )}
      </div>
      <div className={`${style.item}__actions`}>
        {variant.product_type === 'bundle' ? (
          <Link to={link} className="btn btn-primary-outline">
            {variant.product_layout === 'bundle_overlay' ? 'Customize It' : 'Customize Bundle'}
          </Link>
        ) : (
          <GhostArrowBtn
            text="Add To Cart"
            type="button"
            disabled={cart.loading || cart.creating || cart.processing}
            size="medium"
            hasArrow={false}
            onClick={addToCart}
          />
        )}
      </div>
      <Like
        id={variant.id}
        className={`${style.item}__like`}
        showNotification={(id) => {
          setNotificationData({
            msg1: `${variant.product_name} has been removed from your wishlist.`,
            undo: () => dispatch(addToWishlist(id)),
          });
          setShowNotification(true);
        }}
      />
    </div>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.object.isRequired,
  lazy: PropTypes.bool,
  setShowNotification: PropTypes.func,
  setNotificationData: PropTypes.func,
};

export default Item;
