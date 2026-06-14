import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy' {
  interface BreakpointOverrides {
    mobile: true;
    tablet: true;
    desktop: true;
  }
}
