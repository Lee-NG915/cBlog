import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import Tag from 'components/Tag';
import { toPrice } from 'utils/number';
import { getVariantLinkObj } from 'utils/link';
import { daysInStock } from 'config';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { LineItemOptions } from 'components/LineItem';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const Variant = (
  {
    className,
    variant,
    listName,
    listPosition,
    lazy,
    rootRef,
    isRootShown,
    socialCollection,
    trackClick,
    url,
    showSku,
    variantName,
    ...rest
  },
  { router }
) => {
  const { desktop } = useBreakpoints();

  const dispatch = useDispatch();
  const link = getVariantLinkObj(variant);

  const handleClick = (e) => {
    if (url) {
      if (trackClick) {
        trackClick(dispatch);
      }
    } else if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (trackClick) {
        trackClick(dispatch);
      }
      router.push({
        ...link,
        state: {
          listName,
          listPosition,
        },
      });
    }
  };

  const image = (
    <div className={`${style.item}__image`}>
      {variant.image_3D ? (
        <ReactPicture
          srcset={variant.image_3D}
          alt={variant.product_name}
          loader={{
            ratio: 1,
            sizes: desktop ? '300px' : ['0.3-sm', '0.5'],
          }}
          lazy={lazy}
        />
      ) : variant.images.length > 0 ? (
        <ReactPicture
          srcset={variant.images[0].links}
          alt={variant.product_name}
          loader={{
            ratio: 0.66,
            sizes: desktop ? '300px' : ['0.3-sm', '0.5'],
          }}
          lazy={lazy}
        />
      ) : (
        <ReactPicture alt={variant.product_name} loader={{ ratio: 0.66 }} />
      )}
    </div>
  );
  return (
    <div className={classNames(style.item, className)} {...rest}>
      <div className={`${style.item}__tag`}>
        <Tag tags={variant?.badges || []} />
      </div>
      {link ? (
        <Link onClick={(e) => handleClick(e)} to={url || { ...link }} className={`${style.item}__imageLink`}>
          {image}
        </Link>
      ) : (
        image
      )}
      {link ? (
        <Link onClick={(e) => handleClick(e)} to={url || { ...link }} className={`${style.item}__name`}>
          {variant.product_name || variantName}
        </Link>
      ) : (
        <div className={`${style.item}__name`}>{variant.product_name || variantName}</div>
      )}
      {showSku && <LineItemOptions className={`${style.item}__skus`} lineItem={{ variant }} />}
      <div className={`${style.item}__price`}>
        {!isNaN(+variant.price) && +variant.price !== +variant.list_price ? (
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
      {variant.available_quantity <= 3 && variant.lead_time <= daysInStock && (
        <div className={`${style.item}__qty`}>Only {variant.available_quantity} left in stock</div>
      )}
    </div>
  );
};

Variant.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.object.isRequired,
  listName: PropTypes.string.isRequired, // for GA product list view tracking
  listPosition: PropTypes.number.isRequired, // for GA product list view tracking
  lazy: PropTypes.bool, // whether lazy loading image
  rootRef: PropTypes.object,
  isRootShown: PropTypes.bool,
  socialCollection: PropTypes.string,
  trackClick: PropTypes.func,
  url: PropTypes.string, // used in shop the look dy collection
  showSku: PropTypes.bool,
  variantName: PropTypes.string,
};

Variant.defaultProps = {
  lazy: true,
  listPosition: 1,
  showSku: false,
};

Variant.contextTypes = {
  router: PropTypes.object,
};

export default Variant;
