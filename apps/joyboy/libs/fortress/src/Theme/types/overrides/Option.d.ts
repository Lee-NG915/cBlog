/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Option' {
  interface OptionPropsVariantOverrides {
    borderplain: true;
    form: true;
    sort: true;
  }
}
