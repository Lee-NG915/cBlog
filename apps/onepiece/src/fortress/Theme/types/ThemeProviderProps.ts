import React, { ReactNode } from 'react';
// import type { Theme, CssVarsThemeOptions } from '@mui/joy/styles';
import type { AppContext } from 'server/types/AppContext';
import type { ThemeSchema, CssVarsThemeOptions } from '../types/Theme';

export type ThemeProviderProps = {
  theme?: ThemeSchema;
  children: ReactNode;
  appContext: AppContext;
};
