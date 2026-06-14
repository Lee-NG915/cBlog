'use client';

import { Box, IconButton, Loading, Stack, Tag, Typography } from '@castlery/fortress';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Slider from 'react-slick';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import {
  MappedSocialUgcItem,
  ProductVariantDetail,
  useLazyGetVariantsByIdsQuery,
} from '@castlery/modules-product-domain';
import { getVariantLink } from '@castlery/modules-product-services';
import { toPrice } from '@castlery/utils';
import { EVENT_SOCIAL_WIDGET } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

interface SocialUgcVariantCarouselProps {
  socialUgc: MappedSocialUgcItem;
  onVariantSelect?: (variant: ProductVariantDetail) => void;
  useInStoryblok?: boolean;
  ugcListIndex?: number;
}

interface ProductCardProps {
  variant: ProductVariantDetail;
  onSelect?: (variant: ProductVariantDetail) => void;
  useInStoryblok?: boolean;
}

//TODO toPrice abby 会优化，现在临时处理
const formatPriceWithoutTrailingZeros = (price: number) => {
  return toPrice(price)?.toString()?.replace(/\.00$/, '');
};

// 自定义左箭头
function CustomPrevArrow({ onClick, useInStoryblok }: { onClick?: () => void; useInStoryblok?: boolean }) {
  return (
    <IconButton
      onClick={onClick}
      variant="image"
      sx={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 56,
        height: 56,
        '&:hover': {
          transform: 'translateY(-50%) scale(1.1)',
        },
        transition: 'all 0.2s ease',
        '--Icon-fontSize': '32px',
        ...(useInStoryblok && {
          borderRadius: '50%',
          backgroundColor: '#fff',
          opacity: 0.7,
          '&:hover': {
            backgroundColor: '#fff',
            opacity: 1,
          },
        }),
      }}
    >
      <ArrowLeft
        sx={{
          ...(useInStoryblok && {
            width: 32,
            height: 32,
            color: '#A45B37',
          }),
        }}
      />
    </IconButton>
  );
}

// 自定义右箭头
function CustomNextArrow({ onClick, useInStoryblok }: { onClick?: () => void; useInStoryblok?: boolean }) {
  return (
    <IconButton
      onClick={onClick}
      variant="image"
      sx={{
        '--fortress-icon-width': '32px',
        '--fortress-icon-height': '32px',
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 56,
        height: 56,
        '&:hover': {
          transform: 'translateY(-50%) scale(1.1)',
        },
        transition: 'all 0.2s ease',
        '--Icon-fontSize': '32px',
        ...(useInStoryblok && {
          borderRadius: '50%',
          backgroundColor: '#fff',
          opacity: 0.7,
          '&:hover': {
            backgroundColor: '#fff',
            opacity: 1,
          },
        }),
      }}
    >
      <ArrowRight
        sx={{
          ...(useInStoryblok && {
            width: 32,
            height: 32,
            color: '#A45B37',
          }),
        }}
      />
    </IconButton>
  );
}

export function VariantCard({ variant, onSelect, useInStoryblok, ...rest }: ProductCardProps) {
  const displayImage = useMemo(
    () =>
      variant?.image_3D ? (
        <FortressImage
          src={variant?.image_3D}
          alt={variant?.product_name}
          ratio={1}
          sizes={['0.2-md', '0.8-sm', '0.8-xs']}
        />
      ) : (
        <FortressImage src={variant?.images[0]?.links?.feed || ''} alt={variant?.product_name} ratio={1.52} />
      ),
    [variant?.image_3D, variant?.images, variant?.product_name]
  );

  const showSalePrice = useMemo(() => {
    return Number(variant?.price) !== Number(variant?.list_price);
  }, [variant?.price, variant?.list_price]);

  const link = getVariantLink(variant);
  return (
    <Stack
      onClick={() => onSelect?.(variant)}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        a: {
          textDecoration: 'none',
        },
      }}
      {...rest}
    >
      {variant?.badges?.[0] && (
        <Tag variant="solid">
          <Typography level="caption2">{variant?.badges?.[0]}</Typography>
        </Tag>
      )}

      <Box
        sx={{
          position: 'relative',
        }}
      >
        {link ? <CustomLink href={link}>{displayImage}</CustomLink> : displayImage}
      </Box>

      {link ? (
        <CustomLink href={link}>
          <Typography
            level="h5"
            sx={{
              color: 'var(--fortress-palette-brand-maroonVelvet-500)',
              ...(useInStoryblok && {
                color: '#323433',
                fontSize: '18px',
                '&:hover': {
                  color: '#A45B37',
                },
              }),
            }}
          >
            {variant?.product_name}
          </Typography>
        </CustomLink>
      ) : (
        <Typography
          level="h5"
          sx={{
            color: 'var(--fortress-palette-brand-maroonVelvet-500)',
          }}
        >
          {variant?.product_name}
        </Typography>
      )}

      {!Number.isNaN(+variant?.price) && showSalePrice ? (
        <Stack mt={useInStoryblok ? 1.5 : 3} direction={'row'} alignItems={'center'} gap={2}>
          <Typography
            level="h5"
            component={'span'}
            variant="plain"
            aria-label={`Sale Price: ${toPrice(Number(variant?.price), true)}`}
            sx={{
              ...(showSalePrice && !useInStoryblok
                ? {
                    fontWeight: 700,
                    color: 'var(--fortress-palette-brand-terracotta-500)',
                  }
                : {
                    color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                  }),
              ...(useInStoryblok && {
                color: '#A45B37',
              }),
            }}
          >
            {formatPriceWithoutTrailingZeros(Number(variant?.price))}
          </Typography>
          <Typography
            level="h5"
            component={'span'}
            variant="plain"
            aria-label={`Regular Price: ${formatPriceWithoutTrailingZeros(Number(variant?.list_price))}`}
            sx={{
              color: 'var(--fortress-palette-brand-mono-500)',
              textDecoration: 'line-through',
              ...(useInStoryblok && {
                color: '#778379',
              }),
            }}
          >
            {formatPriceWithoutTrailingZeros(Number(variant?.list_price))}
          </Typography>
        </Stack>
      ) : (
        <Typography
          mt={useInStoryblok ? 1.5 : 3}
          level="h5"
          component={'span'}
          variant="plain"
          aria-label={`Sale Price: ${formatPriceWithoutTrailingZeros(Number(variant?.price))}`}
          sx={{
            ...(useInStoryblok && {
              color: '#A45B37',
            }),
          }}
        >
          {formatPriceWithoutTrailingZeros(Number(variant?.price))}
        </Typography>
      )}
    </Stack>
  );
}

export function SocialUgcVariantCarousel({
  socialUgc,
  onVariantSelect,
  useInStoryblok,
  ugcListIndex,
}: SocialUgcVariantCarouselProps) {
  const dispatch = useAppDispatch();
  const sliderRef = useRef<Slider>(null);
  const [getVariantsByIds, { isFetching, currentData: variants, isError }] = useLazyGetVariantsByIdsQuery();

  useEffect(() => {
    if (socialUgc?.variants) {
      getVariantsByIds(socialUgc.variants);
    }
  }, [getVariantsByIds, socialUgc?.variants]);

  const handleTrack = useCallback(async () => {
    await dispatch(
      EVENT_SOCIAL_WIDGET({ action: 'product_link_click', label: socialUgc._uid, position: ugcListIndex })
    );
  }, [dispatch, socialUgc._uid, ugcListIndex]);

  if (!variants || variants.length === 0) {
    return null;
  }

  const sliderSettings = {
    dots: false,
    infinite: variants.length > 1,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    // lazyLoad: true,
    initialSlide: 0,
    arrows: variants.length > 1,
    prevArrow: <CustomPrevArrow useInStoryblok={useInStoryblok} />,
    nextArrow: <CustomNextArrow useInStoryblok={useInStoryblok} />,
  };

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems={'center'}
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: `0 23%`,
        '.slick-slider': {
          width: '100%',
          touchAction: 'pan-y',
          userSelect: 'none',
          '& .slick-list': {
            overflow: 'hidden',
          },
          '& .slick-track': {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            '& .slick-slide': {
              padding: `0 2px !important`,
            },
          },
        },
      })}
    >
      {isFetching ? (
        <Loading
          theme="dark"
          sx={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <Slider ref={sliderRef} {...sliderSettings}>
          {variants?.map((variant, index) => (
            <VariantCard
              key={variant?.id}
              variant={variant}
              onSelect={(args) => {
                onVariantSelect?.(args);
                handleTrack();
              }}
              useInStoryblok={useInStoryblok}
            />
          ))}
        </Slider>
      )}
    </Stack>
  );
}

export default SocialUgcVariantCarousel;
