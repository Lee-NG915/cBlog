'use client';

import {
  Combination,
  OptionType,
  OptionValue,
  Product,
  ProductOptionValueConfig,
  useLazyGetVariantByVariantIdQuery,
  Variant,
} from '@castlery/modules-product-domain';
import { usePathname, useSearchParams } from 'next/navigation';
import { createUrl } from '@castlery/utils';
import { useCallback, useMemo } from 'react';
import { EVENT_PDP_CONFIGURATION } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { logger } from '@castlery/observability/client';

interface UseProductOptionValuesProps {
  sortOptionType: OptionType;
  product: Product;
  variant: Variant | undefined;
  combinations: Combination[];
}

export const useProductOptionValues = (props: UseProductOptionValuesProps) => {
  const { sortOptionType, product, variant, combinations } = props;
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [getVariantByVariantId] = useLazyGetVariantByVariantIdQuery();

  const handleTrack = useCallback(
    async ({ action, label, skuName, skuId }: { action: string; label: string; skuName: string; skuId: string }) => {
      await dispatch(
        EVENT_PDP_CONFIGURATION({
          action,
          label,
          skuName,
          skuId,
        })
      );
    },
    [dispatch]
  );

  const clickHandler = useCallback(
    async (currentOptionVariantId: number | undefined, optionValue: OptionValue, optionName: string) => {
      if (!currentOptionVariantId) {
        currentOptionVariantId = combinations.find((combination) => {
          return combination[sortOptionType?.name] === optionValue?.name;
        })?.id;
        if (!currentOptionVariantId) return;
      }
      try {
        const res = await getVariantByVariantId(currentOptionVariantId, false).unwrap();

        const optionSearchParams = new URLSearchParams(searchParams.toString());
        if (res) {
          handleTrack({
            action: optionName,
            label: optionValue?.presentation,
            skuName: res?.name,
            skuId: res?.sku,
          });
          for (const { option_type_name, name } of res.variant_option_values) {
            optionSearchParams.set(option_type_name, name);
          }
        }
        optionSearchParams.set(optionName, optionValue?.name);
        const optionUrl = createUrl(pathname, optionSearchParams);
        window.history.replaceState(null, '', optionUrl);
      } catch (error) {
        logger.error('Failed to handle product option click', {
          error: error instanceof Error ? error.message : String(error),
          optionName,
          optionValue: optionValue?.name,
          currentOptionVariantId,
        });
      }
    },
    [combinations, getVariantByVariantId, pathname, searchParams, sortOptionType?.name, handleTrack]
  );

  const sortOptionValues = useMemo(() => {
    const optionOrderMap = new Map();
    if (combinations) {
      combinations.forEach((combination, index) => {
        const optionValueName = combination[sortOptionType.name];
        if (optionValueName && !optionOrderMap.has(optionValueName)) {
          optionOrderMap.set(optionValueName, index);
        }
      });
    }

    let values = sortOptionType?.values
      ?.filter(({ name }) => combinations?.find((combination) => combination[sortOptionType.name] === name))
      ?.map((optionValue) => {
        const optionName = sortOptionType?.name;
        const optionSearchParams = new URLSearchParams(searchParams?.toString());
        if (variant) {
          for (const { option_type_name, name } of variant.variant_option_values) {
            optionSearchParams.set(option_type_name, name);
          }
        }
        const isSelected = optionSearchParams.get(optionName) === optionValue?.name;
        optionSearchParams.set(optionName, optionValue?.name);
        const filtered = Array.from(optionSearchParams?.entries())?.filter(([key, value]) =>
          product?.option_types.find(
            (option) => option.name === key && option.values.find(({ name }) => name === value)
          )
        );
        const currentOptionVariantCombination = combinations?.find((combination) =>
          filtered?.every(([key, value]) => combination[key] === value)
        );
        const currentOptionVariantId = currentOptionVariantCombination?.id;

        const result: ProductOptionValueConfig = {
          id: optionValue?.id?.toString(),
          name: optionValue?.name,
          value: optionValue?.presentation,
          label: optionValue?.presentation,
          image: optionValue?.image_url,
          collection: optionValue?.collection,
          isSelected,
          isCustomized: currentOptionVariantCombination?.is_customized || false,
          onSelect: () => clickHandler(currentOptionVariantId, optionValue, optionName),
        };

        const allCombinationsWithThisValue = combinations?.filter((combination) => {
          return combination[sortOptionType?.name] === optionValue?.name;
        });

        const customizedCombinations = allCombinationsWithThisValue?.filter((combination) => {
          return combination.is_customized;
        });

        if (customizedCombinations?.length === allCombinationsWithThisValue?.length) {
          result.isCustomized = true;
        }

        return result;
      })
      ?.sort((a, b) => {
        const aOrder = optionOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = optionOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });

    // Sort orientation values with 'left' items first
    if (sortOptionType.name === 'orientation' && values) {
      values = values.sort((a, b) => {
        const aHasLeft = a.value?.toLowerCase().includes('left');
        const bHasLeft = b.value?.toLowerCase().includes('left');
        if (aHasLeft && !bHasLeft) return -1;
        if (!aHasLeft && bHasLeft) return 1;
        return 0;
      });
    }

    return values;
  }, [
    clickHandler,
    combinations,
    product?.option_types,
    searchParams,
    sortOptionType.name,
    sortOptionType?.values,
    variant,
  ]);

  return {
    clickHandler,
    sortOptionValues,
  };
};
