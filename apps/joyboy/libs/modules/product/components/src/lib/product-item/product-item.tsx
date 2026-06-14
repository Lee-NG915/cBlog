'use client';
import { Box, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { toPrice } from '@castlery/utils';
import React from 'react';
import Slider from 'react-slick';

export interface ProductItemProps {
  name: string;
  description?: string;
  images: any[];
  price: string;
  strikeThroughPrice?: string;
  tag?: string;
  fromStoryblok?: boolean;
  lifestyle_images?: any[];
  colorOptions?: { value: string; presentation: string; image_src: string }[];
  onSwitchVariant?: (value: string) => void;
  selectedColor?: string;
  link?: string;
}
export function ProductItem({
  name,
  images,
  price,
  description,
  strikeThroughPrice,
  tag = '',
  fromStoryblok,
  lifestyle_images,
  colorOptions,
  onSwitchVariant,
  selectedColor,
  link,
}: ProductItemProps) {
  const { desktop, tablet } = useBreakpoints();
  const showStrikeThroughPrice = !!strikeThroughPrice;
  const [showLifeStyleImage, setShowLifeStyleImage] = React.useState(false);
  const [showAnimation, setShowAnimation] = React.useState(false);

  React.useEffect(() => {
    if (showLifeStyleImage) {
      setTimeout(() => {
        setShowAnimation(true);
      }, 100);
    } else {
      setTimeout(() => {
        setShowAnimation(false);
      }, 100);
    }
  }, [showLifeStyleImage]);

  const renderImgPart = () => {
    if (!fromStoryblok) {
      return (
        <Stack>
          {images
            ?.filter((img) => img)
            .map((img) => (
              <FortressImage
                key={img.feed}
                src={img.feed}
                alt={img.alt || name}
                imageWidth={desktop || tablet ? 350 : 202}
                imageHeight={desktop || tablet ? 235 : 202}
              />
            ))}
        </Stack>
      );
    }
    if (fromStoryblok && lifestyle_images) {
      if (desktop) {
        return (
          <Stack
            sx={{
              position: 'relative',
              width: '100%',
              // width: desktop || tablet ? 346 : 166,
              // height: desktop || tablet ? 346 : 166,
            }}
            onMouseEnter={() => setShowLifeStyleImage(true)}
            onMouseLeave={() => setShowLifeStyleImage(false)}
          >
            <Stack
              sx={{
                display: showLifeStyleImage ? 'none' : 'block',
                opacity: showAnimation ? 0 : 1,
                transition: 'opacity .4s linear 0s',
              }}
            >
              {images
                ?.filter((img) => img)
                .map((img) => (
                  <FortressImage
                    key={img.feed}
                    src={img.feed}
                    alt={img.alt || name}
                    // imageWidth={100}
                    sx={{
                      width: '100%',
                    }}
                    ratio={1}
                    // imageWidth={desktop || tablet ? 346 : 166}
                    // imageHeight={desktop || tablet ? 346 : 166}
                  />
                ))}
            </Stack>
            <Stack
              sx={{
                display: showLifeStyleImage ? 'block' : 'none',
                opacity: showAnimation ? 1 : 0,
                transition: 'opacity .4s linear 0s',
              }}
            >
              {lifestyle_images
                ?.filter((img) => img)
                .map((img) => (
                  <FortressImage
                    key={img.feed}
                    src={img.feed}
                    alt={img.alt || name}
                    sx={{
                      width: '100%',
                    }}
                    ratio={1}
                    // imageWidth={desktop || tablet ? 346 : 166}
                    // imageHeight={desktop || tablet ? 346 : 166}
                  />
                ))}
            </Stack>
          </Stack>
        );
      } else {
        return (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              // width: tablet ? 346 : 166,
              // height: tablet ? 346 : 166,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              '.slick-slider': {
                // height: tablet ? 346 : 166,
              },
              '.slick-track': {
                display: 'flex',
              },
              '.slick-list': {
                // height: tablet ? 346 : 166,
                overflow: 'hidden',
              },
              '.slick-slide': {
                // height: tablet ? 346 : 166,
                div: {
                  // height: tablet ? 346 : 166,
                  position: 'relative',
                },
              },
              '.slick-dots': {
                position: 'absolute',
                bottom: '8px',
                width: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex !important',
                padding: 0,
                margin: 0,
                '.slick-active': {
                  backgroundColor: (theme) => theme.palette.brand.sage[500],
                },
                li: {
                  minWidth: '8px',
                  minHeight: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#CCC',
                  'list-style-type': 'none',
                  marginRight: '8px',
                },
                button: {
                  display: 'none',
                },
              },
            }}
          >
            <Slider
              arrows={false}
              dots={true}
              slidesToShow={1}
              slidesToScroll={1}
              infinite={false}
              onTouchStart={(e: React.TouchEvent) => {
                e.stopPropagation();
              }}
              onTouchMove={(e: React.TouchEvent) => {
                e.stopPropagation();
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              >
                {images
                  ?.filter((img) => img)
                  .map((img) => (
                    <Stack
                      sx={{
                        width: '100%',
                        padding: '0 2px',
                      }}
                    >
                      <FortressImage
                        key={img.feed}
                        src={img.feed}
                        alt={img.alt || name}
                        sx={{
                          width: '100%',
                        }}
                        ratio={1}
                      />
                    </Stack>
                  ))}
              </Stack>
              <Stack
                sx={{
                  position: 'absolute',
                  zIndex: 2,
                  // transition: 'opacity .4s linear 0s',
                  left: 0,
                  top: 0,
                  // '&: hover': {
                  //   opacity: 1,
                  // },
                }}
              >
                {lifestyle_images
                  ?.filter((img) => img)
                  .map((img) => (
                    <Stack
                      sx={{
                        width: '100%',
                        padding: '0 2px',
                      }}
                    >
                      <FortressImage
                        key={img.feed}
                        src={img.feed}
                        alt={img.alt || name}
                        sx={{
                          width: '100%',
                        }}
                        ratio={1}
                      />
                    </Stack>
                  ))}
              </Stack>
            </Slider>
          </Box>
        );
      }
    }
  };

  return (
    <Stack
      spacing={2}
      sx={{
        width: '100%',
        position: 'relative',
        alignItems: 'center',
      }}
    >
      {tag !== '' && (
        <Typography
          sx={{
            position: 'absolute',
            left: '5px',
            top: '5px',
            zIndex: 10,
            padding: '2px 8px',
            background: 'rgb(119, 131, 121)',
            color: (theme) => theme.palette.brand.charcoal[0],
            fontSize: '12px',
            width: 'fit-content',
          }}
        >
          {tag}
        </Typography>
      )}
      {link ? (
        <Link
          href={link}
          sx={{
            width: '100%',
          }}
        >
          {renderImgPart()}
        </Link>
      ) : (
        renderImgPart()
      )}
      {!fromStoryblok && (
        <Stack sx={{ width: '100%' }}>
          <Typography
            level="body1"
            sx={{
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Typography>
          <Typography
            level="caption2"
            sx={{
              width: '100%',
              color: (theme) => theme.palette.brand.charcoal[500],
              textAlign: 'center',
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>
          <Stack direction={'row'} spacing={1} sx={{ justifyContent: 'center' }}>
            <Typography
              level="body1"
              sx={{
                color: showStrikeThroughPrice
                  ? (theme) => theme.palette.brand.terracotta[500]
                  : (theme) => theme.palette.text.primary,
              }}
            >
              {toPrice(Number(price), true)}
            </Typography>
            {showStrikeThroughPrice && (
              <Typography
                level="body1"
                sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.charcoal[500] }}
              >
                {toPrice(Number(strikeThroughPrice), true)}
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
      {fromStoryblok && (
        <Stack
          sx={{
            width: '100%',
            padding: 2,
            alignItems: 'flex-start',
          }}
        >
          <Link
            href={link}
            sx={{
              width: '100%',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            <Typography
              level="body1"
              sx={{
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textWrap: 'wrap',
              }}
            >
              {name}
            </Typography>
          </Link>
          <Typography
            level="caption2"
            sx={{
              width: 'fit-content',
              color: (theme) => theme.palette.brand.charcoal[500],
              textAlign: 'center',
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>
          <Stack direction={'row'} spacing={1} sx={{ justifyContent: 'center', marginTop: 1 }}>
            <Typography
              level="body1"
              sx={{
                color: showStrikeThroughPrice
                  ? (theme) => theme.palette.brand.terracotta[500]
                  : (theme) => theme.palette.text.primary,
              }}
            >
              {toPrice(Number(price), true)}
            </Typography>
            {showStrikeThroughPrice && (
              <Typography
                level="body1"
                sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.charcoal[500] }}
              >
                {toPrice(Number(strikeThroughPrice), true)}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              marginTop: 2,
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {colorOptions?.map((colorOption, index) => {
                if (index > 2) return null;
                return (
                  <Stack
                    key={colorOption.value}
                    sx={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: selectedColor === colorOption.value ? '1px solid #000' : null,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onSwitchVariant && onSwitchVariant(colorOption.value);
                    }}
                  >
                    <FortressImage
                      src={colorOption.image_src}
                      alt={colorOption.presentation}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                      }}
                    />
                  </Stack>
                );
              })}
              {colorOptions && colorOptions?.length > 3 && (
                <Typography
                  level="caption2"
                  sx={{
                    color: (theme) => theme.palette.brand.charcoal[500],
                    fontSize: 12,
                    marginLeft: 0.5,
                  }}
                >
                  +{colorOptions.length - 3}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export default ProductItem;
