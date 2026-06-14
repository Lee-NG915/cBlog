// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { ReactNode } from 'react';
// import type { Theme, CssVarsThemeOptions } from '@mui/joy/styles';
// import type { AppContext } from 'server/types/AppContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ThemeSchema } from '../types/Theme';
import type { Options } from '@emotion/cache';

export type ThemeProviderProps = {
  theme?: ThemeSchema;
  children: ReactNode;
  options: Options;
};
