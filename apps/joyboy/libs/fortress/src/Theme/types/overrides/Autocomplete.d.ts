// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Autocomplete' {
  interface AutocompletePropsVariantOverrides {
    borderplain: true;
  }
}
