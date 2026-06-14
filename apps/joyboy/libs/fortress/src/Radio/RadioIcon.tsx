import React from 'react';
import MuiRadio from '@mui/joy/Radio';
import { RadioProps as MuiRadioProps } from '@mui/joy/Radio';

const iconRadioStyles = {
  '--Radio-size': '40px',
  position: 'relative',

  '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedBorder': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedBg': 'var(--fortress-palette-brand-warmLinen-500)',

  '--variant-outlinedHoverBg': 'var(--fortress-palette-neutral-300)',
  '--variant-outlinedHoverColor': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedHoverBorder': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedFocusBg': 'var(--fortress-palette-neutral-300)',
  '--variant-outlinedFocusBorder': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedActiveBg': 'var(--fortress-palette-neutral-300)',
  '--variant-outlinedActiveColor': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedActiveBorder': 'var(--fortress-palette-neutral-500)',
  '--variant-outlinedDisabledBg': 'transparent',
  '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
  '--variant-outlinedDisabledBorder': 'var(--fortress-palette-brand-mono-500)',

  '& .MuiSvgIcon-root': {
    pointerEvents: 'none',
    zIndex: 2,
  },

  '&:not(.Mui-checked):not(.Mui-disabled) svg': {
    fill: 'var(--fortress-palette-neutral-500)',
  },
  '& .MuiRadio-action': {},

  '& .MuiRadio-radio': {
    '--variant-borderWidth': '1px',
    position: 'relative',
  },
  '& .MuiRadio-radio:hover': {},
  '& .MuiRadio-radio:focus': {},

  // 修复：选择当前元素（根元素），而不是子元素
  '&.Mui-checked:not(.Mui-disabled)': {
    '& .MuiRadio-radio': {
      borderColor: 'var(--fortress-palette-neutral-500)',
      color: 'var(--fortress-palette-brand-warmLinen-500)',
      backgroundColor: 'var(--fortress-palette-neutral-500)',
      '& svg': {
        fill: 'var(--fortress-palette-brand-warmLinen-500)',
      },
    },
  },

  // '&.Mui-disabled:not(.Mui-checked)': {
  //   '& .MuiRadio-radio': {
  //     backgroundColor: 'transparent',
  //     '& svg': {
  //       fill: 'var(--fortress-palette-brand-mono-500)',
  //     },
  //   },
  // },
} as const;

export type RadioIconProps = MuiRadioProps;

export const RadioIcon = React.forwardRef<HTMLInputElement, RadioIconProps>((props, ref) => {
  const { sx, ...other } = props;

  return (
    <MuiRadio
      ref={ref}
      sx={{
        ...iconRadioStyles,
        ...sx,
      }}
      {...other}
    />
  );
});
