'use client';
import { useMemo } from 'react';
import { useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '../../fortress-image/fortress-image';

interface ProductImageProps {
  src: string;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  const { desktop } = useBreakpoints();

  const sizeProps = useMemo(() => {
    if (desktop) {
      return {
        imageWidth: 142,
        imageHeight: 95,
        ratio: 142 / 95,
      };
    }
    return {
      imageWidth: 165,
      imageHeight: 100,
      ratio: 165 / 100,
    };
  }, [desktop]);

  return <FortressImage src={src} alt={alt} {...sizeProps} />;
}

export default ProductImage;
