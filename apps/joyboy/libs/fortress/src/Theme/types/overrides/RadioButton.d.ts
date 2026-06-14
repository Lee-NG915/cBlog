/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssVarsThemeOptions } from '@mui/joy';

import type { RadioButtonProps } from '../../../Radio/RadioButton';

declare module '@mui/joy/styles/components' {
  interface Components {
    JoyRadioButton?: {
      defaultProps?: Partial<RadioButtonProps>;
      styleOverrides?: {
        root?: any;
      };
    };
  }
}
