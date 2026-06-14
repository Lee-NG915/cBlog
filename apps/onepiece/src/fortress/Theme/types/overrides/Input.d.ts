import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Input' {
  interface InputPropsVariantOverrides {
    borderplain: true;
  }
}
