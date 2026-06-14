// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/IconButton' {
  interface IconButtonPropsSizeOverrides {
    xs: true;
  }
  interface IconButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
    tertiary: true;
    image: true;
  }
}
