import React from 'react';
import { useTheme } from '@mui/joy';
import Chip from '@mui/joy/Chip';
import type { ChipProps as MChipProps, ChipOwnerState } from '@mui/joy/Chip';
import { chipClasses as tagClasses } from '@mui/joy/Chip';

type VariantProp = 'plain' | 'outlined' | 'solid';

export type TagProps = Omit<MChipProps, 'variant'> & {
  variant?: VariantProp;
};
type VariantPropsMap = {
  [Key in NonNullable<TagProps['variant']>]: TagProps;
};

// TODO 使用style来写样式而不是sx
// sx有覆盖问题，我还思考好怎么处理
const variants: VariantPropsMap = {
  solid: {
    variant: 'solid',
    style: {
      backgroundColor: `var(--_Chip-primary-color)`,
    },
  },
  outlined: {
    variant: 'outlined',
    style: {
      color: `var(--_Chip-primary-color)`,
      borderColor: `var(--_Chip-primary-color)`,
    },
  },
  plain: {
    variant: 'plain',
    style: {
      color: `var(--_Chip-primary-color)`,
    },
  },
};

export const Tag = React.forwardRef<HTMLDivElement, TagProps>(function Tag(inProps, ref) {
  const { variant = 'solid', ...props } = inProps;
  const theme = useTheme();
  let { style: variantStyle = {}, ...defaultProps } = variants[variant] || {};
  return (
    <Chip
      ref={ref}
      color="primary"
      style={{
        '--_Chip-primary-color': theme.palette.brand.sage[500],
        '--_Chip-radius': 0,
        ...variantStyle,
      }}
      {...defaultProps}
      {...props}
    />
  );
});
export { tagClasses };
