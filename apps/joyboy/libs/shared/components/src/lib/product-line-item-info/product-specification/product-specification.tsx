'use client';

import { Stack, Typography } from '@castlery/fortress';
import { OrderHistoryItem } from '@castlery/modules-order-domain';

interface ProductSpecificationProps {
  variantOptionValues: OrderHistoryItem['variant']['variantOptionValues'];
}

export function ProductSpecification({ variantOptionValues }: ProductSpecificationProps) {
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

export default ProductSpecification;
