import { useBreakpoints } from '@castlery/fortress';
import React, { useMemo } from 'react';
import { toPrice } from 'utils/number';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import classNames from 'classnames';
import Tag from 'components/Tag';
import style from './style.scss';

const widths = [400, 550, 600, 700, 800];

export const VariantInfoFromDY = (props, { router }) => {
  const { variant, className, lazy, link = true, style: styles, customRef } = props;
  const { desktop } = useBreakpoints();
  const sizes = desktop ? '330px' : '50vw';
  const baseImage = useMemo(() => {
    const { image_url } = variant;
    if (image_url) {
      return (
        <ReactPicture
          srcset={image_url}
          alt={variant.spu_name}
          loader={{ ratio: 1, widths, sizes, objectFit: 'contain' }}
          lazy={lazy}
        />
      );
    }
    return <ReactPicture alt={variant.spu_name} loader={{ ratio: 1, objectFit: 'contain' }} />;
  }, [lazy, sizes, variant]);
  const baseImageBlock = useMemo(
    () => (
      <div
        key={`${variant.group_id}-base`}
        className={`${style.variantInfo}__baseImage`}
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        {baseImage}
      </div>
    ),
    [baseImage, variant.group_id]
  );
  const priceBlock = useMemo(() => {
    const { sale_price, price } = variant;
    const pricePresentation = `${toPrice(price, true)}`;
    if (price !== Number(sale_price)) {
      return (
        <div className={`${style.variantInfo}__price`}>
          <span aria-label={`Sale Price: ${pricePresentation}`}>{pricePresentation}</span>
          <span aria-label={`Regular Price: ${toPrice(sale_price, true)}`}>{toPrice(sale_price, true)}</span>
        </div>
      );
    }
    return (
      <div className={`${style.variantInfo}__price`} aria-label={`Price: ${pricePresentation}`}>
        {pricePresentation}
      </div>
    );
  }, [variant]);
  return (
    <div className={classNames(style.variantInfo, className)} style={styles} ref={customRef || null}>
      <div className={classNames(`${style.variantInfo}__tag`, `${style.variantInfo}__tagPDP`)}>
        <Tag tags={variant?.badges?.split(',') || []} />
      </div>
      {link ? (
        <Link
          to={variant.url}
          onClick={() => {
            router.push(variant.url);
          }}
          aria-label={`Click to view more detail about ${variant.spu_name}`}
        >
          {baseImageBlock}
        </Link>
      ) : (
        <>{baseImageBlock}</>
      )}
      <div className={`${style.variantInfo}__bottom`} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Link
          className={classNames(`${style.variantInfo}__name`)}
          to={variant.url}
          onClick={
            link
              ? () => {
                  router.push(variant.url);
                }
              : (e) => e.preventDefault()
          }
        >
          {variant.spu_name}
        </Link>
        {priceBlock}
      </div>
    </div>
  );
};

VariantInfoFromDY.propTypes = {
  variant: PropTypes.object.isRequired,
  className: PropTypes.string,
  lazy: PropTypes.bool,
  link: PropTypes.bool,
  style: PropTypes.object,
  customRef: PropTypes.object,
};
VariantInfoFromDY.contextTypes = {
  router: PropTypes.object,
};
