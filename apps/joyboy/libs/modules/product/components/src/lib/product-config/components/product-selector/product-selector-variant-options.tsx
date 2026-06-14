'use client';

import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ProductOptionsLabel } from '../product-configurable-options/product-options-label';
import { ProductOptionsValues } from '../product-configurable-options/product-options-values';
import cloneDeep from 'lodash.clonedeep';

interface ProductSelectorVariantOptionsProps {
  optionNames: string[];
}

export const ProductSelectorVariantOptions = (props: ProductSelectorVariantOptionsProps) => {
  const { optionNames } = props;
  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const { mobile } = useBreakpoints();
  if (!product) {
    return null;
  }

  return (
    <Stack mx={4}>
      {optionNames.map((optionName, index) => {
        const currentSortOptionType = product?.option_types?.find((optionType) => optionType.name === optionName);
        if (!currentSortOptionType) {
          return null;
        }

        const sortOptionType = cloneDeep(currentSortOptionType);
        return (
          <Stack key={currentSortOptionType?.id} mt={mobile ? 5 : 6}>
            <Typography variant="plain">
              <ProductOptionsLabel optionType={sortOptionType} variant={variant} />
            </Typography>
            <ProductOptionsValues sortOptionType={sortOptionType} product={product} variant={variant} />
          </Stack>
        );
      })}
    </Stack>
  );
};
