'use client';
import { ImageV2 } from '@castlery/modules-cms-domain';
import { selectVariant } from '@castlery/modules-product-domain';
import { FortressCarousel } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useMemo } from 'react';
import { WebCarouselModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';

interface WebCarouselProps {
  [key: string]: string | Array<any>;
}

export function WebCarousel(props: WebCarouselProps) {
  const { data_source, banner_ratio, image_ratio } = props;
  const variant = useAppSelector(selectVariant);
  const carouselData = useMemo(() => {
    if (data_source && data_source[0]?.product_banner_images?.length > 0) {
      return data_source[0]?.product_banner_images?.map((item: ImageV2, index: number) => {
        return {
          src: item?.filename,
          width: 500,
          height: 500,
          alt: `storyblok-product-banner-${index}`,
        };
      });
    } else {
      return variant?.assets
        ?.filter((asset) => {
          return asset?.type === 'lifestyle_other';
        })
        .map((item, index) => {
          return {
            src: item?.links?.large,
            width: 500,
            height: 500,
            alt: `product-banner-${index}`,
          };
        });
    }
  }, [data_source, variant?.assets]);

  if (carouselData?.length === 0) return null;
  return (
    <DtStack useImpression uid={variant?.product_name} componentName={WebCarouselModuleName}>
      <FortressCarousel
        outerModuleName={WebCarouselModuleName}
        carouselData={carouselData}
        ratio={Number(banner_ratio)}
        imageRatio={Number(image_ratio)}
      />
    </DtStack>
  );
}

export default WebCarousel;
