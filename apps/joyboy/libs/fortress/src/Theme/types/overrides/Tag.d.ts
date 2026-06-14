// eslint-disable-next-line
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Chip' {
  interface ChipPropsVariantOverrides {
    lightSolid: true;
  }
}
