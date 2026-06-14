import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Button' {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
    tertiary: true;
  }
}
