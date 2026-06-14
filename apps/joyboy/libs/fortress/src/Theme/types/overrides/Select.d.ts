// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Select' {
  interface SelectPropsVariantOverrides {
    borderplain: true;
    sort: true;
    form: true;
  }
}
