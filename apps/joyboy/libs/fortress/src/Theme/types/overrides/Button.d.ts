// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

declare module '@mui/joy/Button' {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
    tertiary: true;
  }

  interface ButtonPropsOverrides {
    imageButtonModule: true;
  }

  interface ButtonGroupPropsOverrides {
    imageButtonModule: true;
  }
  interface ButtonOwnerState {
    imageButtonModule?: boolean;
  }
}
