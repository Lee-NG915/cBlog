'use client';

import { Box, useBreakpoints } from '../..';

export function DatePickerStyleWrapper({ children }: { children: React.ReactNode }) {
  const { mobile } = useBreakpoints();
  return (
    <Box
      sx={{
        width: '100%',
        color: (theme) => theme.palette.text.primary,
        '& .rdp-root': {
          '--rdp-animation_duration': '0.5s',
          '--rdp-accent-color': (theme) => theme.palette.brand.maroonVelvet[500],
          '--rdp-day-width': mobile ? '40px' : '48px',
          '--rdp-day-height': mobile ? '40px' : '48px',
          '--rdp-day_button-width': mobile ? '40px' : '48px',
          '--rdp-day_button-height': mobile ? '40px' : '48px',
          '--rdp-day_button-border': '0px',
          '--rdp-selected-border': '0px',
          '--rdp-day_button-border-radius': '0px',
          '--rdp-weekday-padding': mobile ? '8px 0px' : '8px 16px',
          '--rdp-disabled-opacity': 0.2,
          '--rdp-outside-opacity': 0.3,
        },
        '& .rdp-root[data-nav-layout="around"] .rdp-month_caption': {
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        '& .rdp-weekday': {
          //h4
          fontFamily: `var(--fortress-fontFamily-display)`,
          fontWeight: `var(--fortress-fontWeight-md)`,
          lineHeight: `var(--fortress-lineHeight-xs)`,
          fontSize: `var(--fortress-fontSize-xl)`,
        },

        '& .rdp-root table': {
          borderCollapse: 'separate',
          width: '100%',
          borderSpacing: (theme) =>
            mobile ? `${theme.spacing(1.5)} ${theme.spacing(3)}` : `${theme.spacing(3)} ${theme.spacing(4)}`,
        },
        '& .rdp-day_button': {
          //body1
          fontWeight: `var(--fortress-fontWeight-md)`,
          lineHeight: `var(--fortress-lineHeight-xs)`, // 1.2
          fontFamily: `var(--fortress-fontFamily-display)`,
          fontSize: `var(--fortress-fontSize-lg)`,
          '&:hover': {
            background: (theme) => theme.palette.brand.terracotta[500],
            color: (theme) => theme.palette.common.white,
          },
        },
        '& .rdp-selected .rdp-day_button': {
          background: (theme) => theme.palette.brand.maroonVelvet[500],
          color: (theme) => theme.palette.common.white,
        },
      }}
    >
      {children}
    </Box>
  );
}
