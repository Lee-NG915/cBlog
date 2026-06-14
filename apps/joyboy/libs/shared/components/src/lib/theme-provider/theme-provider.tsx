'use client';
import * as React from 'react';
import { NextAppDirEmotionCacheProvider } from './emotion-cache';
import { CssBaseline, CssVarsProvider, fortressV2Theme } from '@castlery/fortress';
import { getSsrMatchMedia } from '@castlery/fortress';
import { GlobalStyles } from '@castlery/fortress';
import './font-styles.css';

export function ThemeProvider({
  appContext,
  children,
}: {
  appContext?: { device: string; theme: string };
  children: React.ReactNode;
}) {
  const theme = fortressV2Theme;
  if (theme.components?.MuiUseMediaQuery?.defaultProps) {
    theme.components.MuiUseMediaQuery.defaultProps.ssrMatchMedia = getSsrMatchMedia(appContext?.device);
  }

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
