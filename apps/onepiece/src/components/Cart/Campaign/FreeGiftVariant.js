import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import { toPrice } from 'utils/number';
import { getVariantLinkObj } from 'utils/link';
import classNames from 'classnames';
import { LineItemOptions } from 'components/LineItem';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const Variant = ({
  className,
  variant,
  listName,
  listPosition,
  lazy,
  trackClick,
  url,
  showSku,
  variantName,
  isMiniCart,
  isModalGift,
  ...rest
}) => {
  const { desktop } = useBreakpoints();

  const link = getVariantLinkObj(variant);

  const image = (
    <div className={`${style.item}__image`}>
      {variant.images.length > 0 ? (
        <ReactPicture
          className={classNames(`${style.item}__image__img`, {
            [`${style.item}__image__mobile`]: isMiniCart,
            [`${style.item}__image__modalGift`]: isModalGift,
          })}
          srcset={variant.images[0].links.feed}
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

  const productName = variant.product_name || variantName;
  const priceText = toPrice(variant.price, true);
  const listPriceText = toPrice(variant.list_price, true);
  const hasSale = !Number.isNaN(+variant.price) && +variant.price !== +variant.list_price;

  return (
    <article
      className={classNames(style.item, className)}
      {...rest}
      aria-labelledby={`gift-variant-${variant.id}-name`}
    >
      {link ? (
        <Link
          href={`${__BASE_URL__}${link?.pathname}${link?.search}` || `${__BASE_URL__}${url}`}
          className={`${style.item}__imageLink`}
          aria-label={`View details for ${productName}`}
          tabIndex={0}
        >
          {image}
        </Link>
      ) : (
        image
      )}
      <Link
        href={`${__BASE_URL__}${link?.pathname}${link?.search}` || `${__BASE_URL__}${url}`}
        className={`${style.item}__freeGift__name ${isModalGift ? `${style.item}__freeGift__name__modalGift` : ''}`}
        id={`gift-variant-${variant.id}-name`}
        aria-label={`View details for ${productName}`}
        tabIndex={0}
        sx={{
          color: '#2B0B15',
        }}
      >
        {productName}
      </Link>
      {showSku && (
        <LineItemOptions
          className={`${style.item}__skus`}
          lineItem={{ variant }}
          aria-label={`Product options for ${productName}`}
        />
      )}
      <div className={`${style.item}__price`} aria-label={`Price information for ${productName}`}>
        {hasSale ? (
          <div className={`${style.item}__price__sale`}>
            <span aria-label={`Sale price: ${priceText}`}>{priceText}</span>
            <span aria-label={`Original price: ${listPriceText}`}>{listPriceText}</span>
          </div>
        ) : (
          <span aria-label={`Price: ${priceText}`}>{priceText}</span>
        )}
      </div>
    </article>
  );
};

Variant.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.object.isRequired,
  listName: PropTypes.string.isRequired, // for GA product list view tracking
  listPosition: PropTypes.number.isRequired, // for GA product list view tracking
  lazy: PropTypes.bool, // whether lazy loading image
  trackClick: PropTypes.func,
  url: PropTypes.string, // used in shop the look dy collection
  showSku: PropTypes.bool,
  variantName: PropTypes.string,
  isMiniCart: PropTypes.bool,
  isModalGift: PropTypes.bool,
};

Variant.defaultProps = {
  lazy: true,
  showSku: false,
  isModalGift: false,
};

Variant.contextTypes = {
  router: PropTypes.object,
};

export default Variant;
