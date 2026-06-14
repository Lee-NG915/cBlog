'use client';

import { EcEnv } from '@castlery/config';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { Box, RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { useCombination } from '../../../../hooks/use-combination';
import { useProductOptionValues } from '../../../../hooks/use-product-option-values';
import type { OptionType, Product, Variant, Combination } from '@castlery/modules-product-domain';

type OttomanDimensionKey = 'side' | 'standard' | 'storage' | 'ottoman';

type OttomanDescriptionConfig = {
  spuPattern: string;
  dimensions: Partial<Record<OttomanDimensionKey, string>>;
  countryOverrides?: Record<string, Partial<Record<OttomanDimensionKey, string>>>;
};

const METRIC_STANDARD_STORAGE_DIMENSIONS = {
  standard: 'W114 x D93cm',
  storage: 'W114 x D93cm',
} satisfies Partial<Record<OttomanDimensionKey, string>>;

const OTTOMAN_DESCRIPTIONS_BY_SPU: OttomanDescriptionConfig[] = [
  {
    spuPattern: 'mori',
    dimensions: {
      side: 'W33.7" x D45.7"',
      ottoman: 'W35.4" x D26.4"',
      standard: 'W44.9" x D36.6"',
      storage: 'W44.9" x D36.6"',
    },
    countryOverrides: {
      AU: METRIC_STANDARD_STORAGE_DIMENSIONS,
      SG: METRIC_STANDARD_STORAGE_DIMENSIONS,
      UK: METRIC_STANDARD_STORAGE_DIMENSIONS,
    },
  },
  {
    spuPattern: 'dawson',
    dimensions: {
      standard: 'W44.9" x D36.6"',
      storage: 'W44.9" x D36.6"',
      ottoman: 'W44.9" x D36.6"',
    },
    countryOverrides: {
      AU: METRIC_STANDARD_STORAGE_DIMENSIONS,
      SG: METRIC_STANDARD_STORAGE_DIMENSIONS,
      UK: METRIC_STANDARD_STORAGE_DIMENSIONS,
    },
  },
  {
    spuPattern: 'jonathan',
    dimensions: {
      ottoman: 'W36.6" x D30.7"',
      standard: 'W44.9" x D36.6"',
      storage: 'W44.9" x D36.6"',
    },
    countryOverrides: {
      AU: METRIC_STANDARD_STORAGE_DIMENSIONS,
      SG: METRIC_STANDARD_STORAGE_DIMENSIONS,
      UK: METRIC_STANDARD_STORAGE_DIMENSIONS,
    },
  },
];

const OTTOMAN_DIMENSION_KEYS = ['side', 'standard', 'storage', 'ottoman'] as const;

export const getOttomanDescription = ({
  spuGroupTitle,
  optionName,
  country,
  configs = OTTOMAN_DESCRIPTIONS_BY_SPU,
}: {
  spuGroupTitle?: string;
  optionName?: string;
  country?: string;
  configs?: OttomanDescriptionConfig[];
}) => {
  const spuTitleLower = spuGroupTitle?.toLowerCase() ?? '';
  const optionNameLower = optionName?.toLowerCase() ?? '';
  const normalizedCountry = country?.toUpperCase() ?? '';
  const spuConfig = configs.find(({ spuPattern }) => spuTitleLower.includes(spuPattern));

  if (!spuConfig) {
    return undefined;
  }

  const descriptionKey = OTTOMAN_DIMENSION_KEYS.find((key) => optionNameLower.includes(key));

  if (!descriptionKey) {
    return undefined;
  }

  return spuConfig.countryOverrides?.[normalizedCountry]?.[descriptionKey] ?? spuConfig.dimensions[descriptionKey];
};

interface InlineOptionGroupProps {
  sortOptionType: OptionType;
  product: Product;
  variant: Variant | undefined;
  combinations: Combination[];
  spuGroupTitle?: string;
}

const InlineOptionGroup = ({
  sortOptionType,
  product,
  variant,
  combinations,
  spuGroupTitle,
}: InlineOptionGroupProps) => {
  const { sortOptionValues } = useProductOptionValues({ sortOptionType, product, variant, combinations });
  const { mobile } = useBreakpoints();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      sortOptionValues?.find((option) => option.id === event.target.value)?.onSelect();
    },
    [sortOptionValues]
  );

  const selectedId = sortOptionValues?.find((option) => option.isSelected)?.id || '';

  if (sortOptionType.name === 'orientation') {
    return (
      <Stack gap={3} alignItems="center">
        <Typography level="body2" variant="plain">{`Which orientation would you like?`}</Typography>
        <RadioGroup name={`inline-${sortOptionType.name}`} value={selectedId} onChange={handleChange}>
          <Stack direction="row" flexWrap="wrap" justifyContent="center" alignItems="center" gap={mobile ? 1 : 3}>
            {sortOptionValues?.map((option) => (
              <RadioButton
                key={option.id}
                label={
                  <Stack direction="row" alignItems="center" gap={2}>
                    {option.image && (
                      <FortressImage
                        src={option.image}
                        alt={option.label}
                        objectFit="cover"
                        sx={{
                          width: 60,
                          height: 40,
                          '--AspectRatio-paddingBottom': 0,
                          filter: option.isSelected ? 'brightness(0) invert(1) sepia(1) brightness(0.97)' : 'none',
                        }}
                        sizes="120px"
                      />
                    )}
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        textTransform: 'lowercase',
                        '&::first-letter': { textTransform: 'uppercase' },
                      }}
                    >
                      {option.label?.toLowerCase()}
                    </Box>
                  </Stack>
                }
                value={option.id}
                sx={{
                  '& .MuiRadio-label': { px: 3, py: 2 },
                  border: 'none',
                  '@media (hover: hover)': {
                    '&:hover img': {
                      filter: 'brightness(0) invert(1) sepia(1) brightness(0.97) !important',
                    },
                  },
                  '@media (hover: none)': {
                    '&:active img': {
                      filter: 'brightness(0) invert(1) sepia(1) brightness(0.97) !important',
                    },
                  },
                }}
              />
            ))}
          </Stack>
        </RadioGroup>
      </Stack>
    );
  } else if (sortOptionType.name === 'ottoman') {
    return (
      <Stack gap={3} justifyContent="center" alignItems="center">
        <Typography level="body2" variant="plain">{`Which ottoman would you like?`}</Typography>
        <RadioGroup name={`inline-${sortOptionType.name}`} value={selectedId} onChange={handleChange}>
          <Stack direction="row" flexWrap="wrap" justifyContent="center" alignItems="center" gap={mobile ? 1 : 3}>
            {sortOptionValues?.map((option) => {
              const description = getOttomanDescription({
                spuGroupTitle,
                optionName: option.name,
                country: EcEnv.NEXT_PUBLIC_COUNTRY,
              });
              return (
                <RadioButton
                  key={option.id}
                  label={
                    <Stack gap={1} alignItems="flex-start">
                      <Typography level="body2">{option.label}</Typography>
                      {description && (
                        <Typography level="caption2" sx={{ textTransform: 'none' }}>
                          {description}
                        </Typography>
                      )}
                    </Stack>
                  }
                  value={option.id}
                  sx={{
                    '& .MuiRadio-label': { px: mobile ? 3 : 4, py: 2 },
                    border: 'none',
                  }}
                />
              );
            })}
          </Stack>
        </RadioGroup>
      </Stack>
    );
  }

  return null;
};

interface InlineOptionGroupWrapperProps {
  optionName: string;
  spuGroupTitle?: string;
}

const InlineOptionGroupWrapper = ({ optionName, spuGroupTitle }: InlineOptionGroupWrapperProps) => {
  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const combinations = useCombination({
    customizations: product?.customizations,
    optionTypes: product?.option_types,
  });

  const currentOptionType = product?.option_types?.find((ot) => ot.name === optionName);
  if (!currentOptionType || !product) return null;

  return (
    <InlineOptionGroup
      sortOptionType={cloneDeep(currentOptionType)}
      product={product}
      variant={variant}
      combinations={combinations}
      spuGroupTitle={spuGroupTitle}
    />
  );
};

interface ProductSelectorInlineVariantOptionsProps {
  optionNames: string[];
  spuGroupTitle?: string;
}

export const ProductSelectorInlineVariantOptions = ({
  optionNames,
  spuGroupTitle,
}: ProductSelectorInlineVariantOptionsProps) => {
  const { mobile } = useBreakpoints();

  return (
    <Stack
      sx={{
        width: '100%',
        pt: 3,
        pb: 5,
        backgroundColor: 'var(--fortress-palette-brand-warmLinen-100)',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      }}
      gap={mobile ? 4 : 5}
    >
      {optionNames.map((optionName) => (
        <InlineOptionGroupWrapper key={optionName} optionName={optionName} spuGroupTitle={spuGroupTitle} />
      ))}
    </Stack>
  );
};
