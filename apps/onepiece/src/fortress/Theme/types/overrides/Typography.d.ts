import { CssVarsThemeOptions } from '@mui/joy';

// Typography
declare module '@mui/joy/styles' {
  /**
   * htmlFontSize 16px
   * |      | rem    | px   |
   * | ---- | ------ | ---- |
   * | xs3  | 0.625  | 10   |
   * | xs2  | 0.75   | 12   |
   * | xs   | 0.875  | 14   |
   * | sm   | 1      | 16   |
   * | md   | 1.125  | 18   |
   * | lg   | 1.25   | 20   |
   * | xl   | 1.375  | 22   |
   * | xl2  | 1.5    | 24   |
   * | xl3  | 1.75   | 28   |
   * | xl4  | 2      | 32   |
   * | xl5  | 2.5625 | 41   |
   * | xl6  | 3.75   | 60   |
   * | xl7  | 4.5    | 72   |
   */
  interface TypographySystemOverrides {
    display1: false;
    display2: false;

    body1: true;
    body2: true;

    body3: false;
    body4: false;
    body5: false;

    subh1: true;
    subh2: true;
    subh3: true;
    caption1: true;
    caption2: true;

    'title-lg': false;
    'title-md': false;
    'title-sm': false;
    'body-lg': false;
    'body-md': false;
    'body-sm': false;
    'body-xs': false;
  }
  interface FontSizeOverrides {
    xl6: true;
    xl5: true;
  }
}
