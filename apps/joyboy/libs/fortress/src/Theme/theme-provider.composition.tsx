import React from 'react';
import CssBaseline from '@mui/joy/CssBaseline';
import { GlobalStyles } from './globalStyles';
import { CssVarsProvider } from '@mui/joy';
import { defaultTheme } from './v1/theme';
import type { ThemeProviderProps } from './types/ThemeProviderProps';

export const ThemeCompositionProvider = (props: ThemeProviderProps) => {
  const { children, theme = defaultTheme } = props;
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </CssVarsProvider>
  );
};
