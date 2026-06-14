// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/styles' {
  interface Components {
    MuiUseMediaQuery: {
      defaultProps?: Record<string, any>;
    };
  }
}
