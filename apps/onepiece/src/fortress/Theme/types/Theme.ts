import type { Theme, CssVarsThemeOptions as JuiCssVarsThemeOptionsTypes, Components } from '@mui/joy/styles';
import type { Components as MuiComponentsTypes } from '@mui/material/styles';

export type ThemeSchema = Theme & {
  components?: Components<Theme> & MuiComponentsTypes<Theme>;
};

export type CssVarsThemeOptions = JuiCssVarsThemeOptionsTypes & {
  components?: Components<Theme> & MuiComponentsTypes<Theme>;
};
