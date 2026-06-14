'use client';
import React, { useMemo, useState } from 'react';
import { Stack, Typography, useBreakpoints, Tag } from '@castlery/fortress';
import { GlobalReview } from '@castlery/modules-product-components';
import type { ProductInfoV2 } from '@castlery/modules-cms-domain';
import { FortressImage } from '@castlery/shared-components';
import type { Product, GlobalReviewSummary, ProductImage, Variant } from '@castlery/modules-product-domain';
import { CmsText } from '../cms-text/cms-text';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectReviewsLength, selectVariant } from '@castlery/modules-product-domain';
import { usePrice } from '@castlery/modules-product-components';
import { useParams } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { ProductInfoModuleName } from './config';
import { PinchZoom } from '@castlery/shared-components';
import { DtStack } from '@castlery/modules-tracking-components';

export interface ProductIntroProps {
  blok: ProductInfoV2;
  product: Product;
  children: React.ReactNode;
}
export function ProductIntro({ blok, product, children }: ProductIntroProps) {
  const { name = '', description, variants = [], reviews, slug } = product || {};
  const { badges } = variants[0] || {};
  const { desktop } = useBreakpoints();
  const currentVariant = useAppSelector(selectVariant);
  const { data_source = [], description_style = [], show_price = true, show_cta = true, reviewsAnchorId } = blok || {};
  const descBlok = { ...description_style[0], text: data_source[0]?.description || description };
  const showReview = reviews && Number((reviews as GlobalReviewSummary)?.average_rating) > 3;
  const allReviewsCount = useAppSelector(selectReviewsLength);
  const { region } = useParams();

  const linkProps = useMemo(() => {
    const reviewsAnchor = reviewsAnchorId ? `#${reviewsAnchorId}` : '';
    const pdpPageHref = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST ?? ''}/${region}/products/${slug}#reviews`;
    return allReviewsCount > 0 ? { href: reviewsAnchor } : { href: pdpPageHref, isExternalFlag: true };
  }, [allReviewsCount, slug, reviewsAnchorId, region]);

  const { variantPrice, variantListPrice } = usePrice({ product, variant: currentVariant as Variant, isBundle: false });
  const defaultClick = (e) => {
    // 滚动到锚点模块的高度
    e.preventDefault();
    const anchor = document.querySelector(`#${reviewsAnchorId}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
    // 阻止默认行为
    return false;
  };

  return (
    <Stack
      sx={{
        flex: 1,
        background: '#FFFDF9',
        ...(desktop ? { py: 4, pl: 4, pr: 7 } : { px: 3, pt: 2, pb: 4 }),
      }}
    >
      <Stack gap={1}>
        {badges?.[0] ? (
          <Tag
            // variant="lightSolid"
            sx={{
              borderRadius: 4,
              backgroundColor: `var(--fortress-palette-brand-wheat-500)`,
            }}
          >
            {badges?.[0]}
          </Tag>
        ) : null}
        <Typography level="h1">{name}</Typography>
        {showReview && (
          <GlobalReview
            outerModuleName={ProductInfoModuleName}
            reviews={reviews as GlobalReviewSummary}
            {...linkProps}
            defaultClick={defaultClick}
          />
        )}
        <CmsText blok={descBlok} />
      </Stack>
      {!!show_price && (
        <Stack direction={'row'} gap={1} sx={{ alignItems: 'center', mt: 2 }}>
          <Typography level="h1" color="primary">
            {variantPrice}
          </Typography>
          {variantPrice !== variantListPrice && (
            <Typography
              level="h2"
              sx={{
                textDecoration: 'line-through',
                color: (theme) => theme.palette.brand.charcoal[500],
              }}
            >
              {variantListPrice}
            </Typography>
          )}
        </Stack>
      )}
      {show_cta && <Stack sx={{ mt: 3 }}>{children}</Stack>}
    </Stack>
  );
}

export interface ProductImageProps {
  picture: ProductImage;
  defaultAlt?: string;
}
export function ProductImage({ picture, defaultAlt = '' }: ProductImageProps) {
  const { desktop, tablet } = useBreakpoints();
  const [open, setOpen] = useState(false);

  return (
    <>
      <DtStack
        uid={picture?.links?.feed}
        componentName={ProductInfoModuleName}
        elementName="Product Image"
        role="button"
        sx={{
          overflow: 'hidden',
          flex: 'none',
          cursor: 'pointer',
          ...(desktop
            ? {
                width: '57.75vw',
                maxWidth: 998,
                maxHeight: 580,
                borderRadius: '15px',
              }
            : tablet
            ? {
                width: '100vw',
                height: 576,
              }
            : {
                width: '100vw',
                height: 260,
              }),
        }}
        onClick={() => setOpen(true)}
      >
        <FortressImage
          src={picture?.links?.feed}
          alt={picture?.alt || defaultAlt}
          objectFit="cover"
          ratio={desktop ? 998 / 580 : 390 / 260}
          lazy={false}
        />
      </DtStack>
      <PinchZoom
        open={open}
        setOpen={setOpen}
        slideImages={[
          {
            src: picture?.links?.feed,
            alt: picture?.alt || defaultAlt,
          },
        ]}
        index={0}
      />
    </>
  );
}
