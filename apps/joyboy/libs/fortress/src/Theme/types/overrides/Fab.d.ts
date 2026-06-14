/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssVarsThemeOptions } from '@mui/joy';

import type { FabProps } from '../../../Fab/Fab';
import type { StyleOverrides } from '@mui/joy/styles/components';
import type { Theme } from '@mui/joy';

declare module '@mui/joy/styles/components' {
  interface Components<Theme = unknown> {
    JoyFab?: {
      defaultProps?: Partial<FabProps>;
      styleOverrides?: StyleOverrides<'root', FabProps, Theme>;
    };
  }
}
