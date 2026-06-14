'use client';

import { Stack, Typography } from '@castlery/fortress';
import { VariantOptionValuesV1 } from '@castlery/types';

interface ProductSpecificationV1Props {
  variantOptionValues: VariantOptionValuesV1[];
}

export function ProductSpecificationV1({ variantOptionValues }: ProductSpecificationV1Props) {
  if (!variantOptionValues || variantOptionValues.length === 0) return null;
  return (
    <Stack>
      {variantOptionValues.map((optionValue) => (
        <Typography
          key={optionValue.name}
          level="caption1"
          sx={{
            color: (theme) => theme.palette.brand.maroonVelvet[300],
          }}
        >
          {optionValue.optionTypePresentation}: {optionValue.presentation}
        </Typography>
      ))}
    </Stack>
  );
}

export default ProductSpecificationV1;
