import { extendTheme as extendJuiTheme } from '@mui/joy/styles';
import type { ThemeSchema, CssVarsThemeOptions } from '../types/Theme';

export const extendTheme = (themeValues: CssVarsThemeOptions): ThemeSchema => {
  return extendJuiTheme(themeValues);
};
