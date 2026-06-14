'use client';
import { FormLabel, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { OptionType, Variant, selectHaveFreeSwatch } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { FreeSwatch } from './free-swatch';
import { useEffect, useMemo, useState } from 'react';

/* eslint-disable-next-line */
export interface ProductOptionLabelProps {}

export const ProductOptionLabel = ({
  option,
  text,
  showFreeSwatch = true,
  variant,
  sx,
}: // TODO showFreeSwatch?: boolean 类型填写是有问题的 理论上  非 text才需要
| { option: OptionType; text?: never; showFreeSwatch?: boolean; variant?: Variant; sx?: any }
  | { option?: never; text: string; showFreeSwatch?: boolean; variant?: Variant; sx?: any }) => {
  const { mobile } = useBreakpoints();
  const minWidth = !mobile ? 200 : 150;
  const haveFreeSwatch = useAppSelector(selectHaveFreeSwatch) && showFreeSwatch;
  const [isNeedShowPresentation, setIsNeedShowPresentation] = useState(false);

  useEffect(() => {
    let needShow = false;
    option?.values.forEach((item) => {
      if (item.image_url !== '') {
        needShow = true;
      }
    });
    setIsNeedShowPresentation(needShow);
  }, [option]);

  const showPresentation = useMemo(() => {
    let presentation = '';
    if (variant && variant?.variant_option_values) {
      variant.variant_option_values.forEach((value) => {
        if (value.option_type_name === option?.name) {
          presentation = value.presentation;
        }
      });
    }
    return presentation;
  }, [variant, option]);

  if (text) {
    return (
      <FormLabel
        sx={{
          minWidth: minWidth,
          mr: !mobile ? 0 : 1,
        }}
      >
        <Typography level="h5">{text}</Typography>
      </FormLabel>
    );
  }

  return (
    <FormLabel
      id={`product-${option?.name.toLocaleLowerCase()}-attribute`}
      sx={{
        boxSizing: 'border-box',
        minWidth: minWidth,
        paddingRight: 1,
        ...sx,
      }}
    >
      <Stack>
        <Typography level="h5">
          {option?.presentation}
          {isNeedShowPresentation ? ':' : ''}
          {isNeedShowPresentation && (
            <Typography
              sx={{
                marginLeft: '8px',
                fontWeight: 300,
              }}
            >
              {showPresentation}
            </Typography>
          )}
        </Typography>
        {option?.name === 'material' && haveFreeSwatch && <FreeSwatch />}
      </Stack>
    </FormLabel>
  );
};
