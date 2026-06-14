/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/styles' {
  interface Shadow {
    raised: {
      sm: string;
      md: string;
      lg: string;
    };
    floating: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
