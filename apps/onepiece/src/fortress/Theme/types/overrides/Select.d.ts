import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Select' {
  interface SelectPropsVariantOverrides {
    borderplain: true;
  }
}
