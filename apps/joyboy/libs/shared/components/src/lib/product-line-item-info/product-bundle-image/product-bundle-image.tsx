'use client';
import { useMemo } from 'react';
import { FortressImage } from '../../fortress-image/fortress-image';
import { Box, useBreakpoints } from '@castlery/fortress';

interface ProductBundleImageProps {
  src: string;
  alt: string;
}

export function ProductBundleImage({ src, alt }: ProductBundleImageProps) {
  const { desktop } = useBreakpoints();
  const sizeProps = useMemo(() => {
    return {
      imageWidth: 132,
      imageHeight: 66,
      ratio: 132 / 66,
    };
  }, []);

  return (
    <Box sx={{ ml: desktop ? 2.5 : 8.5 }}>
      <FortressImage src={src} alt={alt} {...sizeProps} />
    </Box>
  );
}

export default ProductBundleImage;
