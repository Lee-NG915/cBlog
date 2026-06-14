'use client';
import { Combination, OptionType, Variant } from '@castlery/modules-product-domain';
import { useCallback } from 'react';
import { displayMode } from '../product-configurable-options/product-options-values';
import { FortressImage, OptionSelector } from '@castlery/shared-components';
import { Box, RadioButton, RadioGroup, Stack, useBreakpoints } from '@castlery/fortress';
import { ProductFabricTooltip } from '../product-configurable-options/product-fabrc-tooltip';
import { useProductBundleOptionValues } from '../../../../hooks/use-product-bundle-option-values';

interface ProductBundleValuesProps {
  optionType?: OptionType;
  variant?: Variant;
  bundleVariants?: Variant[];
  combinations?: Combination[];
  onOptionClick?: (tempBundleVariant: Variant) => void;
}

export const ProductBundleValues = (props: ProductBundleValuesProps) => {
  const { optionType, variant, combinations, bundleVariants, onOptionClick } = props;
  const currentDisplayMode = displayMode[optionType?.name as keyof typeof displayMode] || 'rectangle';
  const { desktop } = useBreakpoints();

  const { optionValues } = useProductBundleOptionValues({
    optionType,
    variant,
    bundleVariants,
    combinations,
    onOptionClick,
  });

  const handleSelect = useCallback(
    (optionId: string) => {
      const selectedOption = optionValues?.find((option) => option.id === optionId);
      if (selectedOption) {
        selectedOption.onSelect();
      }
    },
    [optionValues]
  );

  return (
    <>
      {currentDisplayMode === 'square' ? (
        <OptionSelector
          options={optionValues || []}
          onSelect={handleSelect}
          maxDisplay={optionValues?.length || 0}
          showAdditionalCount={false}
          sx={{
            flexWrap: 'wrap',
          }}
          variant="square"
          size={64}
          isProductPage={true}
          isNeedTooltip={desktop ? true : false}
          TooltipContent={ProductFabricTooltip}
        />
      ) : (
        <RadioGroup
          name="bundle-options"
          value={optionValues?.find((option) => option.isSelected)?.id || ''}
          onChange={(event) => {
            const selectedOption = optionValues?.find((option) => option.id === event.target.value);
            selectedOption?.onSelect();
          }}
        >
          <Stack direction={'row'} flexWrap={'wrap'} gap={3}>
            {optionValues?.map((option) => (
              <RadioButton
                key={option.id}
                label={
                  option.image ? (
                    <FortressImage
                      src={option.image}
                      alt={option.label}
                      sx={{ width: 101, height: 40, '--AspectRatio-paddingBottom': 0 }}
                      sizes={101 + 'px'}
                    />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        textTransform: 'lowercase',
                        '&::first-letter': {
                          textTransform: 'uppercase',
                        },
                      }}
                    >
                      {option.label?.toLowerCase()}
                    </Box>
                  )
                }
                value={option.id}
                sx={{
                  ...(option.image && {
                    '& .MuiRadio-label': {
                      px: 2,
                      py: 1,
                    },
                  }),
                }}
              />
            ))}
          </Stack>
        </RadioGroup>
      )}
    </>
  );
};
