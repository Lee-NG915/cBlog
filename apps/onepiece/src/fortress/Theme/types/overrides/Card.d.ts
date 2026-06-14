import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Card' {
  interface CardPropsVariantOverrides {
    borderless: true;
  }
}
