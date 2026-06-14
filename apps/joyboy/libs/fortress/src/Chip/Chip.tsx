import type { ChipProps as MChipProps } from '@mui/joy/Chip';
import MChip from '@mui/joy/Chip';
import { useTheme } from '@mui/joy';
import { forwardRef } from 'react';

export const Chip = forwardRef<HTMLDivElement, MChipProps>((props, ref) => {
  const theme = useTheme();
  return (
    <MChip
      ref={ref}
      {...props}
      sx={{
        px: theme.spacing(3),
        gap: theme.spacing(2),
        '--variant-outlinedColor': 'var(--fortress-palette-neutral-900)',
        '--variant-outlinedBorder': 'var(--fortress-palette-brand-mono-200)',
        '--variant-outlinedHoverBg': 'var(--fortress-palette-brand-mono-200)',
        '--variant-outlinedHoverBorder': 'var(--fortress-palette-brand-mono-200)',
        '--variant-outlinedActiveColor': 'var(--fortress-palette-neutral-900)',
        '--variant-outlinedActiveBg': 'var(--fortress-palette-brand-mono-400)',
        '--variant-outlinedActiveBorder': 'var(--fortress-palette-brand-warmLinen-400)',
        '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
        '--variant-outlinedDisabledBorder': 'var(--fortress-palette-brand-mono-500)',
        '--variant-outlinedDisabledBg': 'transparent',
        [theme.breakpoints.down('sm')]: {
          height: 30, // 小屏幕
        },
        [theme.breakpoints.up('sm')]: {
          height: 32, // 大屏幕
        },
        '& .MuiChip-label': {
          alignItems: 'center',
          gap: theme.spacing(2),
          '& svg': {
            width: theme.spacing(5),
            height: theme.spacing(5),
          },
        },
        ...theme.typography.caption1,
        ...props.sx,
      }}
    />
  );
});

export default Chip;
export type { MChipProps };
