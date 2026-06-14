'use client';

import { OptionType, Variant } from '@castlery/modules-product-domain';
import { Box, Typography } from '@castlery/fortress';
import { useMemo } from 'react';

interface ProductOptionsLabelProps {
  variant: Variant | undefined;
  optionType: OptionType;
}

export const ProductOptionsLabel = (props: ProductOptionsLabelProps) => {
  const { optionType, variant } = props;
  const optionPresentation = useMemo(() => {
    let presentation = '';
    if (variant && variant?.variant_option_values) {
      variant.variant_option_values.forEach((value) => {
        if (value.option_type_name === optionType?.name) {
          presentation = value.presentation;
        }
      });
    }
    return presentation?.toLowerCase() || '';
  }, [variant, optionType]);

  const typePresentation = useMemo(() => optionType?.presentation?.toLowerCase() || '', [optionType?.presentation]);

  return (
    <Typography level="body1">
      <Box
        component="span"
        sx={{
          textTransform: 'lowercase',
          display: 'inline-block',
          '&::first-letter': {
            textTransform: 'uppercase',
          },
        }}
      >
        {typePresentation}
      </Box>
      :{' '}
      <Typography
        component="span"
        level="body1"
        sx={{
          fontStyle: 'italic',
          textTransform: 'lowercase',
          display: 'inline-block',
          '&::first-letter': {
            textTransform: 'uppercase',
          },
        }}
      >
        {optionPresentation}
      </Typography>
    </Typography>
  );
};
