import React, { ReactNode } from 'react';
import { CssVarsProvider } from '@mui/joy';
import { defaultTheme } from './default-theme';
import type { ThemeProviderProps } from './types/ThemeProviderProps';
import { getSsrMatchMedia } from '../utils/ssr';

export function ThemeProvider({
  /* the default theme will be created in the next step */
  theme = defaultTheme,
  children,
  appContext,
}: ThemeProviderProps) {
  if (theme.components?.MuiUseMediaQuery?.defaultProps) {
    theme.components.MuiUseMediaQuery.defaultProps.ssrMatchMedia = getSsrMatchMedia(appContext?.device);
  }
  return <CssVarsProvider theme={theme}>{children}</CssVarsProvider>;
}
