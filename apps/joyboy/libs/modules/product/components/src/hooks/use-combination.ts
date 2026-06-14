import { Combination, Product } from '@castlery/modules-product-domain';
import { useMemo } from 'react';
import { optionTypesStrToObj } from '../lib/variant-selector/variant-selector';

interface UseCombinationProps {
  customizations: Product['customizations'] | undefined;
  optionTypes: Product['option_types'] | undefined;
}

export const useCombination = (props: UseCombinationProps) => {
  const { customizations, optionTypes } = props;
  return useMemo(() => {
    return customizations?.map((variant) => ({
      id: variant.variant_id,
      availableForSale: !variant.discontinued,
      is_customized: variant.is_customized,
      ...optionTypesStrToObj(variant.option_types).reduce((accumulator, optionId) => {
        const item = optionTypes?.find(({ id }) => id === optionId.option_type_id);
        const val = item?.values.find(({ id }) => id === optionId.option_value_id);
        if (!item || !val) return { ...accumulator };
        return { ...accumulator, [item.name]: val.name };
      }, {}),
    })) as Combination[];
  }, [customizations, optionTypes]);
};
