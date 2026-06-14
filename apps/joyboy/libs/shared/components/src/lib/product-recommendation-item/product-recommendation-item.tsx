'use client';
import { Stack, Typography, useBreakpoints, Tag, Link } from '@castlery/fortress';
import { FortressImage } from '../fortress-image/fortress-image';
import { toPrice } from '@castlery/utils';
import type { VariantImage } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';

interface Image extends Pick<VariantImage, 'feed'> {
  alt?: string;
}

export interface ProductRecommendationItemProps {
  name: string;
  description?: string;
  images: Image[];
  price: string;
  strikeThroughPrice?: string;
  tag?: string;
  fromStoryblok?: boolean;
  lifestyle_images?: any[];
  url: string;
}
export function ProductRecommendationItem({
  name,
  images,
  price,
  description,
  strikeThroughPrice,
  tag = '',
  fromStoryblok,
  lifestyle_images,
  url,
}: ProductRecommendationItemProps) {
  const { desktop, mobile } = useBreakpoints();
  const inMiniCart = useAppSelector(selectMiniCartMode);

  const showStrikeThroughPrice = !!strikeThroughPrice;
  return (
    <Link
      href={url}
      underline="none"
      sx={{
        display: 'block',
        position: 'relative',
        ...(desktop
          ? inMiniCart
            ? {
                width: 248,
              }
            : {
                width: '20.25vw',
                maxWidth: 350,
                minWidth: 212,
              }
          : mobile
          ? {
              width: '51.79vw',
              maxWidth: 202,
            }
          : {
              width: '45.57vw',
              maxWidth: 350,
            }),
      }}
    >
      <Tag
        variant="solid"
        sx={{
          position: 'absolute',
          left: 4,
          top: 4,
          zIndex: 10,
          ...(!tag && { display: 'none' }),
        }}
      >
        {tag}
      </Tag>
      {/* --------------- images section start ------------------- */}
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <FortressImage src={images[0].feed} alt={images[0].alt || ''} ratio={mobile || inMiniCart ? 1 : 350 / 235} />
      </Stack>
      {/* --------------- images section end ------------------- */}
      <Stack
        sx={{
          ...(mobile ? { p: 4 } : { px: 6, mt: 2 }),
        }}
      >
        <Typography
          level="body1"
          sx={{
            width: '100%',
            textAlign: 'center',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: mobile ? 3 : 2,
            textOverflow: 'ellipsis',
            boxSizing: 'border-box',
          }}
        >
          {name}
        </Typography>
        <Typography
          level={mobile ? 'caption1' : 'caption2'}
          sx={{
            width: '100%',
            textAlign: 'center',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: mobile ? 3 : 2,
            textOverflow: 'ellipsis',
            mt: mobile ? 2 : 1,
            boxSizing: 'border-box',
            color: (theme) => theme.palette.brand.mono[700],
          }}
        >
          {description}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: 'center', columnGap: 2, mt: 2, boxSizing: 'border-box' }}>
          <Typography
            level="body1"
            sx={{
              color: showStrikeThroughPrice
                ? (theme) => theme.palette.brand.terracotta[500]
                : (theme) => theme.palette.brand.maroonVelvet[500],
            }}
          >
            {toPrice(Number(price), true)}
          </Typography>
          <Typography
            level="body1"
            sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.mono[500] }}
          >
            {showStrikeThroughPrice ? toPrice(Number(strikeThroughPrice), true) : ''}
          </Typography>
        </Stack>
      </Stack>
    </Link>
  );
}

export default ProductRecommendationItem;
