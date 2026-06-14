import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import Slick from 'react-slick';
import Like from 'components/Like';
import { daysInStock, enableDisplayLeadtime } from 'config';
import lang from 'utils/lang';
import { getProductLink } from 'utils/link';
import Tag from 'components/Tag';
import TrackImpression from 'components/TrackImpression';
import { getBreadcrumbsByPathname } from 'pages';
import { EVENT_PRODUCT_CLICK } from 'utils/track/constants';
import { connect } from 'react-redux';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

const widths = [400, 550, 600, 700, 800];

@connect(null, (dispatch) => ({
  trackProductClick: (result) => dispatch({ type: EVENT_PRODUCT_CLICK, result }),
}))
@withUseBreakpoints
export default class Product extends Component {
  static propTypes = {
    listName: PropTypes.string.isRequired, // the list the product belongs to, can be used in ga tracking
    listPosition: PropTypes.number.isRequired, // position in the result list
    product: PropTypes.object.isRequired,
    link: PropTypes.bool, // whether display links
    lazy: PropTypes.bool, // whether lazy load images
    showHover: PropTypes.bool, // show hover options
    className: PropTypes.string,

    isRootShown: PropTypes.bool,
    rootRef: PropTypes.object,
    isUsedInPDP: PropTypes.bool, // used for new product page
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  static defaultProps = {
    link: true,
    lazy: true,
    showHover: true,
    isUsedInPDP: false,
  };

  state = { index: 0, hovering: false };

  onMouseEnter = () => {
    this.setState({
      hovering: true,
    });
  };

  onMouseLeave = () => {
    this.setState({
      hovering: false,
    });
  };

  switchVariant = (pindex) => {
    const { index } = this.state;
    if (index !== pindex) {
      this.setState({ index: pindex });
    }
  };

  currentLink = () => {
    const { index } = this.state;
    const {
      product: { variants, slug },
    } = this.props;
    const link = getProductLink(slug);

    if (variants.length > 0) {
      const options = variants[index].option_values;
      const query = Object.keys(options)
        .map((key) => `${key}=${options[key].value}`)
        .join('&');
      const optionTypes = {};
      Object.keys(options).forEach((key) => (optionTypes[key] = options[key].value));
      if (index === 0) {
        return {
          url: link,
          pathname: link,
          state: {
            optionTypes,
          },
        };
      }
      return {
        url: `${link}${query && `?${query}`}`,
        pathname: link,
        search: query && `?${query}`,
      };
    }
    return {
      url: link,
      pathname: link,
    };
  };

  noImage = (images) => !Array.isArray(images) || images.length === 0;

  clickProduct = (e) => {
    // determine the variant jumping to
    const { product, listName, listPosition } = this.props;
    const { variants, decisionId, variationId, slotId } = product;
    const { index } = this.state;
    const { router } = this.context;
    const { taxons } = product;

    const variant = variants[index] || product;

    const breadcrumbs = getBreadcrumbsByPathname(router.location.pathname);

    this.props.trackProductClick({
      variant,
      taxons,
      decisionId,
      variationId,
      slotId,
    });
    const { pathname, search, state } = this.currentLink();
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();

      router.push({
        pathname,
        search,
        state: {
          ...state,
          listName,
          listPosition,
          breadcrumbs,
        },
      });
    }
  };

  render() {
    const {
      lazy,
      link,
      showHover,
      listName,
      listPosition,
      rootRef,
      isRootShown,
      className,
      product,
      isUsedInPDP,
      breakpoints = {},
    } = this.props;
    const { variants, colorVariantsLength, lengthVariantsLength, colorOptionLimit } = product;
    const { index, hovering } = this.state;
    const { desktop: isDesktop } = breakpoints;
    const sizes = isDesktop ? '330px' : '50vw';
    if (variants.length === 0) {
      return null;
    }
    // determine variant
    const variant = variants[index];
    // render the image
    const baseImage = !this.noImage(variant.images) ? (
      <ReactPicture
        srcset={variant.images[0]}
        alt={product.name}
        loader={{ ratio: 1, widths, sizes, objectFit: 'contain' }}
        lazy={lazy}
        showSkeleton
      />
    ) : (
      <ReactPicture alt={product.name} loader={{ ratio: 1, objectFit: 'contain' }} />
    );
    let lifeImage = null;

    if (variant.life_style_image) {
      lifeImage = (
        <ReactPicture
          key={`${variant.id}-life`}
          srcset={variant.life_style_image}
          alt={product.name}
          loader={{ ratio: 1, widths, sizes }}
          className={`${style.product}__lifeImage`}
          lazy
        />
      );
    }

    const baseImageBlock = (
      <div
        key={`${variant.id}-base`}
        className={`${style.product}__baseImage`}
        style={{ ...(isUsedInPDP && { paddingLeft: 0, paddingRight: 0 }) }}
      >
        {baseImage}
      </div>
    );

    let slider;
    let mask;
    if (!isUsedInPDP && !isDesktop && showHover && lifeImage) {
      slider = (
        <Slick
          key={variant.id}
          speed={400}
          dots
          arrows={false}
          draggable={false}
          // eslint-disable-next-line react/no-unstable-nested-components
          appendDots={(dots) => <ul> {dots} </ul>}
          infinite={false}
        >
          {[baseImageBlock, lifeImage]}
        </Slick>
      );
    }
    if (!isUsedInPDP && isDesktop && showHover) {
      mask = (
        <div
          className={classNames(`${style.product}__mask`, {
            [`${style.product}__mask--hover`]: hovering,
          })}
        >
          {lifeImage}
          <div className={`${style.product}__like`}>
            <Like id={variant.id} />
          </div>
          {enableDisplayLeadtime && variant.lead_time_presentation && (
            <div className={`${style.product}__leadTime`}>
              <span>
                {lang.t('common.dispatch')} <strong>{variant.lead_time_presentation}</strong>
              </span>
            </div>
          )}
        </div>
      );
    }

    // render the price
    let priceBlock;
    const pricePresentation = `${product.product_type === 'bundle' ? 'From ' : ''}${toPrice(variant.price, true)}`;

    if (variant.price !== variant.list_price) {
      priceBlock = (
        <div className={`${style.product}__price`}>
          <span aria-label={`Sale Price: ${pricePresentation}`}>{pricePresentation}</span>
          <span aria-label={`Regular Price: ${toPrice(variant.list_price, true)}`}>
            {toPrice(variant.list_price, true)}
          </span>
        </div>
      );
    } else {
      priceBlock = (
        <div className={`${style.product}__price`} aria-label={`Price: ${pricePresentation}`}>
          {pricePresentation}
        </div>
      );
    }

    // determine colorOptions

    const optionsMap = {};
    variants.forEach((v) => {
      if (Object.keys(v.option_values).length > 0) {
        Object.keys(v.option_values).forEach((key) => {
          if (optionsMap[key]) {
            if (!optionsMap[key].includes(v.option_values[key].value)) {
              optionsMap[key].push(v.option_values[key].value);
            }
          } else if (['material', 'color_option', 'wood', 'leg_color', 'frame'].includes(key)) {
            optionsMap[key] = [];
            if (!optionsMap[key].includes(v.option_values[key].value)) {
              optionsMap[key].push(v.option_values[key].value);
            }
          }
        });
      }
    });
    let selectedOptionValue = 'material';
    if (Object.keys(optionsMap).length > 0) {
      if (optionsMap?.material?.length > 1) {
        selectedOptionValue = 'material';
      } else if (optionsMap?.color_option?.length > 1) {
        selectedOptionValue = 'color_option';
      } else if (optionsMap?.wood?.length > 1) {
        selectedOptionValue = 'wood';
      } else if (optionsMap?.leg_color?.length > 1) {
        selectedOptionValue = 'leg_color';
      } else if (optionsMap?.frame?.length > 1) {
        selectedOptionValue = 'frame';
      } else if (optionsMap?.material?.length === 1) {
        selectedOptionValue = 'material';
      } else if (optionsMap?.color_option?.length === 1) {
        selectedOptionValue = 'color_option';
      } else if (optionsMap?.wood?.length === 1) {
        selectedOptionValue = 'wood';
      } else if (optionsMap?.leg_color?.length === 1) {
        selectedOptionValue = 'leg_color';
      } else if (optionsMap?.frame?.length === 1) {
        selectedOptionValue = 'frame';
      }
    }

    const colorOptions = variants.map((v) => v.option_values[selectedOptionValue]).filter(Boolean);

    const truncateString = (inputString, maxLength) => {
      if (inputString.length <= maxLength) {
        return inputString;
      }
      return `${inputString.slice(0, maxLength)}...`;
    };

    return (
      <TrackImpression
        item={variant}
        taxons={product.taxons}
        listName={listName}
        listPosition={listPosition}
        rootRef={rootRef}
        triggerOnce={false}
        isRootShown={isRootShown}
      >
        <div
          data-selenium="category-product"
          className={classNames(style.product, className, {
            'can-hover': showHover,
          })}
        >
          <div
            onMouseEnter={isDesktop ? this.onMouseEnter : null}
            onMouseLeave={isDesktop ? this.onMouseLeave : null}
            className={classNames({
              [`${style.product}__base--hover`]: !isUsedInPDP && hovering && !!lifeImage,
            })}
          >
            <div
              className={classNames(`${style.product}__tag`, {
                [`${style.product}__tagPDP`]: isUsedInPDP,
              })}
            >
              <Tag tags={variant?.badges || []} />
            </div>
            {link ? (
              <Link
                to={this.currentLink().url}
                onClick={this.clickProduct}
                aria-label={`Click to view more detail about ${product.name}`}
              >
                {slider || baseImageBlock}
                {mask}
              </Link>
            ) : (
              <>
                {slider || baseImageBlock}
                {mask}
              </>
            )}
          </div>
          <div
            className={`${style.product}__bottom`}
            style={{ ...(isUsedInPDP && { paddingLeft: 0, paddingRight: 0 }) }}
          >
            <Link
              className={classNames(`${style.product}__name`, {
                'is-disabled': !link,
              })}
              to={this.currentLink().url}
              onClick={link ? this.clickProduct : (e) => e.preventDefault()}
            >
              {product.name}
            </Link>
            {product?.variants[index]?.product_short_description && (
              <div className={`${style.product}__shortDesc`}>
                {truncateString(product?.variants[index]?.product_short_description, 38)}
              </div>
            )}

            {priceBlock}

            {!isUsedInPDP && colorOptions.length > 1 && (
              <div className={`${style.product}__color`}>
                {colorOptions.map((colorOption, i) => (
                  <button
                    type="button"
                    onClick={() => this.switchVariant(i)}
                    className={classNames(`${style.product}__color__tone btn`, {
                      'is-selected': index === i,
                    })}
                    key={i}
                  >
                    {/* <img
                      title={colorOption.presentation}
                      src={colorOption.image_src.replace('w_800', 'w_60')}
                      alt={colorOption.value}
                    /> */}
                    <ReactPicture
                      srcset={colorOption.image_src.replace('w_800', 'w_60')}
                      title={colorOption.presentation}
                      alt={colorOption.value}
                    />
                  </button>
                ))}
                {colorVariantsLength > colorOptionLimit && (
                  <span className={`${style.product}__color__more`}>+{colorVariantsLength - colorOptionLimit}</span>
                )}
              </div>
            )}

            {!isUsedInPDP &&
              variant.available_quantity &&
              variant.available_quantity <= 3 &&
              variant.lead_time <= daysInStock && (
                <p className={`${style.product}__info ${style.product}__info--red`}>
                  Only {variant.available_quantity} left in stock
                </p>
              )}

            {!isUsedInPDP && lengthVariantsLength > 1 && (
              <p className={`${style.product}__info`}>{lengthVariantsLength} sizes available</p>
            )}
          </div>
        </div>
      </TrackImpression>
    );
  }
}
