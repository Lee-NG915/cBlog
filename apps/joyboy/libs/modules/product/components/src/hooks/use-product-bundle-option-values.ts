'use client';

import { Combination, OptionType, OptionValue, Variant } from '@castlery/modules-product-domain';
import { useCallback, useMemo } from 'react';

interface UseProductBundleOptionValuesProps {
  optionType?: OptionType;
  variant?: Variant;
  bundleVariants?: Variant[];
  combinations?: Combination[];
  onOptionClick?: (tempBundleVariant: Variant) => void;
}

interface BundleOptionValueConfig {
  id: string;
  name: string;
  value: string;
  label: string;
  image?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const useProductBundleOptionValues = (props: UseProductBundleOptionValuesProps) => {
  const { optionType, variant, bundleVariants, combinations, onOptionClick } = props;

  const clickHandler = useCallback(
    (targetCombinationId?: number, optionValue?: OptionValue) => {
      if (!targetCombinationId) {
        const targetCombination = combinations?.find((combination) => {
          if (optionType) {
            return combination[optionType?.name] === optionValue?.name;
          }
          return false;
        });
        targetCombinationId = targetCombination?.id;
        if (!targetCombinationId) return;
      }
      const targetVariant = bundleVariants?.find((variant) => variant.id === targetCombinationId);
      if (!targetVariant) return;
      onOptionClick?.({
        ...variant,
        ...targetVariant,
      });
    },
    [bundleVariants, combinations, onOptionClick, optionType, variant]
  );

  const optionValues = useMemo(() => {
    const optionOrderMap = new Map();
    if (combinations && optionType?.name) {
      combinations.forEach((combination, index) => {
        const optionValueName = combination[optionType.name];
        if (optionValueName && !optionOrderMap.has(optionValueName)) {
          optionOrderMap.set(optionValueName, index);
        }
      });
    }

    let values: BundleOptionValueConfig[] | undefined = optionType?.values
      ?.filter(({ name }) => combinations?.find((combination) => combination[optionType.name] === name))
      ?.map((optionValue) => {
        const optionMap = new Map(
          variant?.variant_option_values?.map((option) => [option.option_type_name, option.name])
        );
        const isSelected = optionMap.get(optionType.name) === optionValue.name;
        optionMap.set(optionType.name, optionValue.name);
        const currentOptionCombination = Array.from(optionMap.entries());
        const targetCombination = combinations?.find((combination) => {
          return currentOptionCombination.every(
            ([key, value]) =>
              combination[key as keyof typeof combination]?.toString() === value && combination.availableForSale
          );
        });
        return {
          id: optionValue?.id?.toString(),
          name: optionValue?.name,
          value: optionValue?.presentation,
          label: optionValue?.presentation,
          image: optionValue?.image_url,
          isSelected,
          onSelect: () => clickHandler(targetCombination?.id, optionValue),
        };
      })
      ?.sort((a, b) => {
        const aOrder = optionOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = optionOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });

    // Sort orientation values with 'left' items first
    if (optionType?.name === 'orientation' && values) {
      values = values.sort((a, b) => {
        const aHasLeft = a.value?.toLowerCase().includes('left');
        const bHasLeft = b.value?.toLowerCase().includes('left');
        if (aHasLeft && !bHasLeft) return -1;
        if (!aHasLeft && bHasLeft) return 1;
        return 0;
      });
    }

    return values;
  }, [optionType?.values, optionType?.name, variant?.variant_option_values, combinations, clickHandler]);

  return {
    optionValues,
  };
};
