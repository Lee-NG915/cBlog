// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Card' {
  interface CardPropsVariantOverrides {
    borderless: true;
  }
}
