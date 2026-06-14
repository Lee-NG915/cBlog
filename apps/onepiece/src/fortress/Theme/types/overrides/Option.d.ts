import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Option' {
  interface OptionPropsVariantOverrides {
    borderplain: true;
  }
}
