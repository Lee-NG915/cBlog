'use client';

import { useSelector } from '@castlery/shared-redux-store';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { Divider, Stack, useBreakpoints } from '@castlery/fortress';
import cloneDeep from 'lodash.clonedeep';
import { ProductOptionsLabel } from './product-options-label';
import { ProductOptionsValues } from './product-options-values';
import { ProductVersionOptions } from '../product-version-options/product-version-options';
import { ProductSelectorSectionOption } from '../product-selector/product-selector-section-option';
import { NavigationState } from '@castlery/types';
import { useMemo } from 'react';

interface ProductConfigurableOptionsProps {
  hasPdpSelector: boolean;
  navigationState?: NavigationState;
}

const UPPER_OPTION_TYPES = ['orientation', 'ottoman'];

export const ProductConfigurableOptions = (props: ProductConfigurableOptionsProps) => {
  const { hasPdpSelector, navigationState } = props;
  const product = useSelector(selectProduct);
  const variant = useSelector(selectVariant);
  const { mobile, tablet } = useBreakpoints();
  const materialCategoryGroup = useMemo(() => {
    const currentSpuGroup = navigationState?.spuGroups?.[0];
    const currentLayoutGroup = currentSpuGroup?.layoutGroups.find((layoutGroup) => layoutGroup.isActive);
    const currentCategoryGroup = currentLayoutGroup?.categoryGroups.find((categoryGroup) => categoryGroup.isActive);
    return currentCategoryGroup;
  }, [navigationState]);

  return (
    <Stack px={mobile ? 6 : tablet ? 6 : undefined}>
      {product?.option_types?.map((optionType, index) => {
        if (hasPdpSelector && UPPER_OPTION_TYPES.includes(optionType.name)) {
          return null;
        }
        const sortOptionType = cloneDeep(optionType);

        if (hasPdpSelector) {
          return (
            <ProductSelectorSectionOption
              sortOptionType={sortOptionType}
              product={product}
              variant={variant}
              categoryGroup={materialCategoryGroup}
            />
          );
        }

        return (
          <Stack key={sortOptionType.id} mt={mobile ? 6 : 8}>
            <ProductOptionsLabel optionType={sortOptionType} variant={variant} />
            <ProductOptionsValues sortOptionType={sortOptionType} product={product} variant={variant} />
          </Stack>
        );
      })}
      <ProductVersionOptions product={product} variant={variant} />
    </Stack>
  );
};
