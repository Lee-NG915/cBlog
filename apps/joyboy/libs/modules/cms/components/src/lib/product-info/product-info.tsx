'use client';
import { useMemo } from 'react';
import { useBreakpoints, buttonClasses } from '@castlery/fortress';
import { ProductIntro, ProductImage } from './content';
import { CmsButton } from '../cms-button/cms-button';
import type { ProductInfoV2 } from '@castlery/modules-cms-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, type Product } from '@castlery/modules-product-domain';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { ProductInfoModuleName } from './config';
import { WebAddToCart, usePhAtcProperities } from '@castlery/modules-product-components';

export interface ProductInfoProps {
  blok: ProductInfoV2;
}
export function ProductInfo({ blok }: ProductInfoProps) {
  const { desktop } = useBreakpoints();
  const { button, data_source = [] } = blok || {};
  const product = useAppSelector(selectProduct) as Product;

  const { variants = [], name = '' } = product || {};
  const picture = useMemo(() => {
    const { image_url: cmsImageUrl } = data_source[0] || {};
    if (cmsImageUrl) {
      return { links: { feed: cmsImageUrl } };
    }
    const { assets, images } = variants[0] || {};
    const lifeStyleImage = Array.isArray(assets) ? assets.find((asset) => asset.type === 'lifestyle') : '';
    if (lifeStyleImage) {
      return lifeStyleImage;
    }
    return Array.isArray(images) ? images[0] : null;
  }, [variants, data_source]);
  const phProps = usePhAtcProperities();

  const buttonBlok = button?.[0] || [];

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={ProductInfoModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      direction={desktop ? 'row' : 'column-reverse'}
      sx={{
        ...(desktop ? { px: 4, pt: 4, pb: '60px' } : {}),
        alignItems: 'center',
        [`& .${buttonClasses.root}`]: {
          width: desktop ? 300 : 'auto',
        },
      }}
    >
      <ProductIntro blok={blok} product={product}>
        <WebAddToCart
          isCmsComponent={true}
          buttonSlot={
            <CmsButton key={buttonBlok._uid} outerModuleName={ProductInfoModuleName} blok={buttonBlok} {...phProps} />
          }
        />
      </ProductIntro>
      <ProductImage picture={picture} defaultAlt={name} />
    </DtStack>
  );
}

export default ProductInfo;
