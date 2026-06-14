'use client';

import { RadioButton, RadioGroup, Stack, Typography } from '@castlery/fortress';
import { Product, useLazyGetVariantByVariantIdQuery, Variant } from '@castlery/modules-product-domain';
import { selectedObjToStr } from '@castlery/modules-product-services';
import { useCallback, useMemo } from 'react';
import { logger } from '@castlery/observability/client';

/**
 * 产品版本选项 only display in configurable product
 * @returns
 */

interface ProductVersionOptionsProps {
  product?: Product;
  variant?: Variant;
}

export const ProductVersionOptions = (props: ProductVersionOptionsProps) => {
  const { product, variant } = props;
  const [getVariantByVariantId, { isFetching }] = useLazyGetVariantByVariantIdQuery();
  const selected = useMemo(() => {
    return product?.option_types?.reduce((acc, curr) => {
      const optionValue = variant?.variant_option_values?.find(({ option_type_id }) => option_type_id === curr?.id);
      acc[curr?.id] = { id: optionValue?.option_value_id || 0 };
      return acc;
    }, {} as Record<string, { id: number }>);
  }, [product?.option_types, variant?.variant_option_values]);

  const { batchOfVariants, currentBatchOfVariant } = useMemo(() => {
    const batchOfVariants = product?.customizations?.filter(
      ({ option_types }) => option_types === selectedObjToStr(selected || {})
    );

    const currentBatchOfVariant = batchOfVariants?.find(({ variant_id }) => variant_id === variant?.id);

    if (!batchOfVariants || batchOfVariants.length <= 1) return { batchOfVariants: null, currentBatchOfVariant: null };

    return { batchOfVariants, currentBatchOfVariant };
  }, [product, selected, variant?.id]);

  const handleChangeBatch = useCallback(
    (targetVariantId: number) => {
      if (currentBatchOfVariant?.variant_id === targetVariantId) return;
      const newBatchOfVariant = batchOfVariants?.find(({ variant_id }) => variant_id === targetVariantId);
      if (!newBatchOfVariant) return;
      try {
        getVariantByVariantId(newBatchOfVariant?.variant_id);
      } catch (error) {
        logger.error('Failed to get variant by variant ID', { error });
      }
    },
    [batchOfVariants, currentBatchOfVariant?.variant_id, getVariantByVariantId]
  );

  if (!batchOfVariants) return null;

  return (
    <Stack mt={6}>
      <Typography>Version: {currentBatchOfVariant?.batch}</Typography>
      <RadioGroup
        name="version-options"
        value={currentBatchOfVariant?.variant_id}
        onChange={(event) => handleChangeBatch(Number(event.target.value))}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" mt={3} gap={3}>
          {batchOfVariants?.map(({ variant_id, batch }) => (
            <RadioButton key={variant_id} label={`${variant_id}: ${batch}`} value={variant_id} />
          ))}
        </Stack>
      </RadioGroup>
    </Stack>
  );
};
