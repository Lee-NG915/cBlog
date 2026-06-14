'use client';

import { Stack, Typography } from '@castlery/fortress';
import { VariantOptionValuesV1 } from '@castlery/types';

interface ProductBundleSpecificationV1Props {
  quantity: number;
  bundleVariantName: string;
  variantOptionValues: VariantOptionValuesV1[];
}

export function ProductBundleSpecificationV1({
  quantity,
  variantOptionValues,
  bundleVariantName,
}: ProductBundleSpecificationV1Props) {
  return (
    <Stack>
      <Typography level="body1">
        {quantity}x {bundleVariantName}
      </Typography>
      {!!variantOptionValues &&
        variantOptionValues.map((optionValue) => (
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

export default ProductBundleSpecificationV1;
