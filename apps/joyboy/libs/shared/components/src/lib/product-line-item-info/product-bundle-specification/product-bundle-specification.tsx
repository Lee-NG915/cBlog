'use client';

import { Stack, Typography } from '@castlery/fortress';
import { OrderHistoryItem } from '@castlery/modules-order-domain';

interface ProductBundleSpecificationProps {
  quantity: number;
  bundleVariantName: string;
  variantOptionValues: OrderHistoryItem['variant']['variantOptionValues'];
}

export function ProductBundleSpecification({
  quantity,
  variantOptionValues,
  bundleVariantName,
}: ProductBundleSpecificationProps) {
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

export default ProductBundleSpecification;
