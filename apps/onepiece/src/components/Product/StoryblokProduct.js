import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import Slick from 'react-slick';
import Like from 'components/Like';
import { getProductLink } from 'utils/link';
import { Typography, Stack, Box } from '@castlery/fortress';
import { useDispatch } from 'react-redux';
import { EVENT_PRODUCT_LISTING_CLICK } from 'utils/track/constants';
import { ImageOrVideo, CustomLink } from 'storyblok/components';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const widths = [400, 550, 600, 700, 800];

const BaseImage = ({ variant, alt, videoUrl, imageUrl }) => {
  const { desktop } = useBreakpoints();
  const sizes = desktop ? '330px' : '50vw';

  const { id, images } = variant || {};
  const isCustomVideo = videoUrl.length > 0;
  const isCustomImage = imageUrl.length > 0;

  const noImage = (images) => !Array.isArray(images) || images.length === 0;

  return (
    <div key={`${id}-base`} className={classNames(`${style.simpleProduct}__baseImage`, { 'is-video': isCustomVideo })}>
      {isCustomVideo || isCustomImage ? (
        <ImageOrVideo
          video={videoUrl}
          image={imageUrl}
          loader={{
            ratio: 1,
            widths,
            sizes,
            objectFit: 'cover',
          }}
        />
      ) : !noImage(images) ? (
        <ReactPicture srcset={images[0]} alt={alt} loader={{ ratio: 1, widths, sizes, objectFit: 'contain' }} />
      ) : (
        <ReactPicture alt={alt} loader={{ ratio: 1, objectFit: 'contain' }} />
      )}
    </div>
  );
};
BaseImage.propTypes = {
  variant: PropTypes.object,
  alt: PropTypes.string,
  videoUrl: PropTypes.array,
  imageUrl: PropTypes.array,
};

const HoverImage = ({ lifeStyleImage, alt, hoverImage }) => {
  const { desktop } = useBreakpoints();
  const sizes = desktop ? '330px' : '50vw';
  if (hoverImage?.length > 0) {
    return (
      <ImageOrVideo
        className={`${style.simpleProduct}__lifeImage`}
        image={hoverImage}
        loader={{
          ratio: 1,
          widths,
          sizes,
          objectFit: 'cover',
        }}
      />
    );
  }
  if (lifeStyleImage) {
    return (
      <ReactPicture
        srcset={lifeStyleImage}
        alt={alt}
        loader={{ ratio: 1, widths, sizes }}
        className={`${style.simpleProduct}__lifeImage`}
      />
    );
  }
  return null;
};
HoverImage.propTypes = {
  lifeStyleImage: PropTypes.object,
  alt: PropTypes.string,
  hoverImage: PropTypes.array,
};

const Mask = ({ hovering, variant, product, hoverImage }) => {
  const { id, life_style_image: lifeStyleImage } = variant || {};
  const { name } = product || {};

  return (
    <div
      className={classNames(`${style.simpleProduct}__mask`, {
        [`${style.simpleProduct}__mask--hover`]: hovering,
      })}
    >
      <HoverImage hoverImage={hoverImage} lifeStyleImage={lifeStyleImage} alt={name} />

      <Box
        sx={(theme) => ({
          position: 'absolute',
          right: theme.spacing(2),
          top: theme.spacing(2),
          zIndex: 3,
          '> button': {
            display: 'flex',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: theme.palette.brand.flour[10],
            '> svg': {
              width: '28px',
              height: '28px',
              stroke: theme.palette.brand.terracotta[500],
            },
          },
        })}
      >
        <Like id={id} />
      </Box>
    </div>
  );
};
Mask.propTypes = {
  hovering: PropTypes.bool,
  product: PropTypes.object,
  variant: PropTypes.object,
  hoverImage: PropTypes.array,
};

const ProductPrice = ({ product, variant }) => {
  const { product_type: productType } = product || {};
  const { price, list_price: listPrice } = variant || {};
  const pricePresentation = `${productType === 'bundle' ? 'From ' : ''}${toPrice(price, true)}`;

  if (price !== listPrice) {
    return (
      <Stack
        direction="row"
        sx={(theme) => ({
          mt: theme.spacing(1),
          [theme.breakpoints.down('sm')]: {
            mt: 0,
          },
        })}
      >
        <Typography
          level="body1"
          aria-label={`Sale Price: ${pricePresentation}`}
          sx={(theme) => ({
            color: theme.palette.brand.terracotta[500],
          })}
        >
          {pricePresentation}
        </Typography>

        <Typography
          level="body1"
          aria-label={`Regular Price: ${toPrice(listPrice, true)}`}
          sx={(theme) => ({
            color: theme.palette.brand.charcoal[500],
            textDecoration: 'line-through',
            ml: theme.spacing(1),
          })}
        >
          {toPrice(listPrice, true)}
        </Typography>
      </Stack>
    );
  }
  return (
    <Typography
      level="body1"
      aria-label={`Price: ${pricePresentation}`}
      sx={(theme) => ({
        color: theme.palette.brand.charcoal[800],
        mt: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
          mt: 0,
        },
      })}
    >
      {pricePresentation}
    </Typography>
  );
};
ProductPrice.propTypes = {
  product: PropTypes.object,
  variant: PropTypes.object,
};

const StoryblokProduct = ({ product, blok, type }, { router }) => {
  const { desktop } = useBreakpoints();
  const { name, variants, slug, colorVariantsLength, colorOptionLimit } = product || {};
  const { description, icon = {}, image_url: imageUrl, hover_image_url: hoverImage, video_url: videoUrl } = blok || {};
  const isCustomVideo = videoUrl?.length > 0;
  const { filename, alt } = icon;
  const link = getProductLink(slug);

  const dispatch = useDispatch();

  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const enableHover = desktop && !isCustomVideo;

  if (!variants || variants?.length === 0) {
    return null;
  }
  const variant = variants[index];
  const { id, life_style_image: lifeStyleImage } = variant || {};

  const onMouseEnter = () => {
    if (enableHover) {
      setHovering(true);
    }
  };

  const onMouseLeave = () => {
    if (enableHover) {
      setHovering(false);
    }
  };

  const switchVariant = (pIndex) => {
    if (index !== pIndex) {
      setIndex(pIndex);
    }
  };

  const currentLink = () => {
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

  const trackClick = () => {
    dispatch({
      type: EVENT_PRODUCT_LISTING_CLICK,
      result: {
        title: name,
        actionName: type === 'detail' ? 'detailed_product_listing_click' : 'simple_product_listing_click',
      },
    });
  };

  const clickProduct = (e) => {
    const { pathname, search } = currentLink();
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      trackClick();

      router.push({
        pathname,
        search,
      });
    }
  };

  let slider;
  if (!desktop && !isCustomVideo && (hoverImage?.length > 0 || lifeStyleImage)) {
    slider = (
      <Slick
        key={id}
        speed={400}
        dots
        arrows={false}
        draggable={false}
        appendDots={(dots) => <ul> {dots} </ul>}
        infinite={false}
      >
        <BaseImage variant={variant} videoUrl={videoUrl} imageUrl={imageUrl} alt={name} />
        <HoverImage hoverImage={hoverImage} lifeStyleImage={lifeStyleImage} alt={name} />
      </Slick>
    );
  }

  const colorOptions = variants
    .map((v) => v.option_values.material || v.option_values.color_option || v.option_values.wood)
    .filter(Boolean);

  return (
    <div className={style.simpleProduct}>
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={classNames({
          [`${style.simpleProduct}__base--hover`]: hovering,
        })}
      >
        {filename && (
          <Box
            sx={(theme) => ({
              width: theme.spacing(4),
              height: 'auto',
              position: 'absolute',
              left: theme.spacing(2),
              top: theme.spacing(2),
              zIndex: 3,
              [theme.breakpoints.down('sm')]: {
                width: theme.spacing(3),
                left: theme.spacing(1),
                top: theme.spacing(1),
              },
            })}
          >
            <ReactPicture
              srcset={filename}
              alt={alt}
              loader={{
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <CustomLink
          link={currentLink()}
          handleClick={clickProduct}
          aria-label={`Click to view more detail about ${name}`}
        >
          {slider || <BaseImage variant={variant} videoUrl={videoUrl} imageUrl={imageUrl} alt={name} />}

          {enableHover && <Mask hovering={hovering} variant={variant} product={product} hoverImage={hoverImage} />}
        </CustomLink>
      </div>

      <Box
        sx={(theme) => ({
          px: theme.spacing(2),
          py: theme.spacing(2),
          '@media (max-width: 375px)': {
            px: theme.spacing(1),
          },
        })}
      >
        <Link to={currentLink().url} onClick={link ? clickProduct : (e) => e.preventDefault()}>
          <Typography
            level="body1"
            sx={(theme) => ({
              ':hover': {
                color: theme.palette.brand.terracotta[500],
              },
            })}
          >
            {name}
          </Typography>
        </Link>

        {description && (
          <Typography
            level={desktop ? 'caption1' : 'caption2'}
            sx={(theme) => ({
              color: theme.palette.brand.charcoal[500],
            })}
          >
            {description}
          </Typography>
        )}

        {type === 'detail' && (
          <>
            <ProductPrice product={product} variant={variant} />

            {colorOptions.length > 1 && (
              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                sx={(theme) => ({
                  gap: '5px',
                  position: 'relative',
                  mt: theme.spacing(2),
                  [theme.breakpoints.down('sm')]: {
                    mt: theme.spacing(1),
                  },
                })}
              >
                {colorOptions.map((colorOption, i) => (
                  <button
                    type="button"
                    onClick={() => switchVariant(i)}
                    className={classNames(`${style.simpleProduct}__color__tone btn`, {
                      'is-selected': index === i,
                    })}
                    key={i}
                  >
                    <img
                      title={colorOption.presentation}
                      src={colorOption.image_src.replace('w_800', 'w_60')}
                      alt={colorOption.value}
                    />
                  </button>
                ))}
                {colorVariantsLength > colorOptionLimit && (
                  <Typography
                    level="caption1"
                    sx={(theme) => ({
                      color: theme.palette.brand.charcoal[500],
                      ml: theme.spacing(0.5),
                    })}
                  >
                    +{colorVariantsLength - colorOptionLimit}
                  </Typography>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>
    </div>
  );
};

StoryblokProduct.propTypes = {
  product: PropTypes.object.isRequired,
  blok: PropTypes.object,
  type: PropTypes.string,
};

StoryblokProduct.contextTypes = {
  router: PropTypes.object,
};

export default StoryblokProduct;
