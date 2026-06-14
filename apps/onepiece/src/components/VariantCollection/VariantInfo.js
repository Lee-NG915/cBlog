import { useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tag from 'components/Tag';
import ReactPicture from 'components/ReactPicture';
import { getBreadcrumbKeysByPathname } from 'utils/track/common';
import { toPrice } from 'utils/number';
import { getProductLink } from 'utils/link';
import useBreakpoints from 'fortress/hooks/useBreakpoints';
import style from './style.scss';

const widths = [400, 550, 600, 700, 800];

export const VariantInfo = (props, { router }) => {
  const {
    variant,
    className,
    lazy,
    link = true,
    listName,
    listPosition,
    productSlug,
    style: styles,
    customRef,
  } = props;
  const { desktop } = useBreakpoints();
  const sizes = desktop ? '330px' : '50vw';
  const baseImage = useMemo(() => {
    const { images } = variant;
    if (Array.isArray(images) && images.length !== 0) {
      return (
        <ReactPicture
          srcset={variant.images[0]?.links?.large}
          alt={variant.name}
          loader={{ ratio: 1, widths, sizes, objectFit: 'contain' }}
          lazy={lazy}
        />
      );
    }
    return <ReactPicture alt={variant.name} loader={{ ratio: 1, objectFit: 'contain' }} />;
  }, [lazy, sizes, variant]);
  const baseImageBlock = useMemo(
    () => (
      <div
        key={`${variant.id}-base`}
        className={`${style.variantInfo}__baseImage`}
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        {baseImage}
      </div>
    ),
    [baseImage, variant.id]
  );
  const currentLink = useMemo(() => {
    const variantLink = getProductLink(productSlug);
    let query = null;
    if (variant?.variant_option_values !== undefined) {
      const variantQueryArr = variant.variant_option_values.map(
        (option) => `${option.option_type_name}=${option.name}`
      );
      query = variantQueryArr.join('&');
    }
    return {
      url: `${variantLink}${query && `?${query}`}`,
      pathname: variantLink,
      search: query && `?${query}`,
    };
  }, [productSlug, variant.variant_option_values]);
  const clickVariant = useCallback(
    (e) => {
      const breadcrumbs = getBreadcrumbKeysByPathname(router.location.pathname);
      const { pathname, search } = currentLink;
      if (!e?.ctrlKey && !e?.metaKey) {
        e.preventDefault();
        router.push({
          pathname,
          search,
          state: {
            listName,
            listPosition,
            breadcrumbs,
          },
        });
      }
    },
    [currentLink, listName, listPosition, router]
  );
  const priceBlock = useMemo(() => {
    const pricePresentation = `${toPrice(variant.price, true)}`;
    if (variant.price !== variant.list_price) {
      return (
        <div className={`${style.variantInfo}__price`}>
          <span aria-label={`Sale Price: ${pricePresentation}`}>{pricePresentation}</span>
          <span aria-label={`Regular Price: ${toPrice(variant.list_price, true)}`}>
            {toPrice(variant.list_price, true)}
          </span>
        </div>
      );
    }
    return (
      <div className={`${style.variantInfo}__price`} aria-label={`Price: ${pricePresentation}`}>
        {pricePresentation}
      </div>
    );
  }, [variant.list_price, variant.price]);
  const truncateString = useCallback((inputString, maxLength) => {
    if (inputString.length <= maxLength) {
      return inputString;
    }
    return `${inputString.slice(0, maxLength)}...`;
  }, []);
  return (
    <div className={classNames(style.variantInfo, className)} style={styles} ref={customRef || null}>
      <div className={classNames(`${style.variantInfo}__tag`, `${style.variantInfo}__tagPDP`)}>
        <Tag tags={variant?.badges || []} />
      </div>
      {link ? (
        <Link
          to={currentLink.url}
          onClick={clickVariant}
          aria-label={`Click to view more detail about ${variant.name}`}
        >
          {baseImageBlock}
        </Link>
      ) : (
        <>{baseImageBlock}</>
      )}
      <div className={`${style.variantInfo}__bottom`} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Link
          className={classNames(`${style.variantInfo}__name`)}
          to={currentLink.url}
          onClick={link ? clickVariant : (e) => e.preventDefault()}
        >
          {variant.name}
        </Link>
        {variant?.product_short_description && (
          <div className={`${style.variantInfo}__shortDesc`}>
            {truncateString(variant?.product_short_description, 38)}
          </div>
        )}

        {priceBlock}
      </div>
    </div>
  );
};

VariantInfo.propTypes = {
  variant: PropTypes.object.isRequired,
  className: PropTypes.string,
  lazy: PropTypes.bool,
  link: PropTypes.bool,
  listName: PropTypes.string,
  listPosition: PropTypes.number,
  productSlug: PropTypes.string,
  style: PropTypes.object,
  customRef: PropTypes.object,
};
VariantInfo.contextTypes = {
  router: PropTypes.object,
};
