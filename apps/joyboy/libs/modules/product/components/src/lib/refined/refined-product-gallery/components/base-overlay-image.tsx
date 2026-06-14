'use client';

import { BundleOption, selectCurrentBundleVariants } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useMemo } from 'react';

interface BaseOverlayImageProps {
  src: string;
  alt: string;
  bundleOptions?: BundleOption[];
  objectFit?: 'cover' | 'contain';
  baseImageSxProps?: any;
  overlayImageSxProps?: any;
  overlayImageSizes?: string | string[];
  lazy?: boolean;
}

export const BaseOverlayImage = (props: BaseOverlayImageProps) => {
  const {
    src,
    alt,
    bundleOptions,
    objectFit,
    baseImageSxProps,
    overlayImageSxProps,
    overlayImageSizes,
    lazy = true,
    ...rest
  } = props;
  const currentBundleVariant = useAppSelector(selectCurrentBundleVariants);
  const overLayList = useMemo(() => {
    return (
      bundleOptions
        ?.map((item) => {
          const currentVariant = currentBundleVariant?.[String(item?.id)];
          if (currentVariant?.overlay?.links?.large_overlay) {
            return currentVariant?.overlay?.links?.large_overlay;
          }
          return null;
        })
        .filter((item): item is string => item !== null) || []
    );
  }, [bundleOptions, currentBundleVariant]);

  return (
    <>
      <FortressImage
        src={src}
        alt={alt}
        lazy={lazy}
        objectFit={objectFit}
        sx={{
          ...baseImageSxProps,
        }}
        {...rest}
      />
      {overLayList.map((item, index) => {
        return (
          <FortressImage
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: index + 10,
              ...overlayImageSxProps,
            }}
            objectFit={objectFit}
            key={index}
            src={item.split('-test').join('')}
            alt=""
            lazy={lazy}
            sizes={overlayImageSizes}
          />
        );
      })}
    </>
  );
};
