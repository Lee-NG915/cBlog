import { extendTheme as extendJuiTheme } from '@mui/joy';

// 导入模块扩展 - 这会执行declare module语句
// import '../types/overrides/Fab.d.ts';
import type { FortressThemeOptions, ThemeSchema } from '../types/Theme';

export const extendTheme = (themeValues: FortressThemeOptions): ThemeSchema => {
  return extendJuiTheme(themeValues) as ThemeSchema;
};
