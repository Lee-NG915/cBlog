import { CssVarsThemeOptions } from '@mui/joy';

export const fontFamily: CssVarsThemeOptions['fontFamily'] = {
  // var(--fortress-fontFamily-body)
  body: `"Poppins",var(--fortress-fontFamily-fallback)`,
  // var(--fortress-fontFamily-display)
  display: `"MinervaModern",var(--fortress-fontFamily-fallback)`,
  // code: '',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'].join(','),
};
/**
 * - --fortress-fontWeight-sm: 300;
 * - --fortress-fontWeight-md: 400;
 * - --fortress-fontWeight-lg: 600;
 * - --fortress-fontWeight-xl: 700;
 */
export const fontWeight: CssVarsThemeOptions['fontWeight'] = {
  sm: 300,
  md: 400,
  lg: 600,
  xl: 700,
};
/**
 * htmlFontSize 16px
 * |      | rem    | px   |
 * | ---- | ------ | ---- |
 * | xs   | 0.75   | 12   |
 * | sm   | 0.875  | 14   |
 * | md   | 1      | 16   |
 * | lg   | 1.125  | 18   |
 * | xl   | 1.25   | 20   |
 * | xl2  | 1.375  | 22   |
 * | xl3  | 1.5    | 24   |
 * | xl4  | 1.75   | 28   |
 * | xl5  | 2      | 32   |
 * | xl6  | 2.5625 | 41   |
 */
export const fontSize: CssVarsThemeOptions['fontSize'] = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  md: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  xl2: '1.375rem', // 22px
  xl3: '1.5rem', // 24px
  xl4: '1.75rem', // 28px
  xl5: '2rem', // 32px
  xl6: '2.5625rem', // 41px
};
export const typography: CssVarsThemeOptions['typography'] = {
  // @ts-ignore
  // display1: undefined,
  // display2: undefined,
  h1: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
    fontDisplay: 'swap',
  }, // 28px
  h2: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
  }, // 24px
  h3: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
  }, // 18px
  h4: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
  }, // 12px
  subh1: {
    // fontWeight: `var(--fortress-fontWeight-lg)`,
    fontFamily: `var(--fortress-fontFamily-body)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
    color: `var(--fortress-palette-text-primary)`,
  },
  subh2: {
    fontFamily: `var(--fortress-fontFamily-body)`,
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    color: `var(--fortress-palette-text-primary)`,
  },
  subh3: {
    fontFamily: `var(--fortress-fontFamily-body)`,
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    color: `var(--fortress-palette-text-primary)`,
  },
  body1: {
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    fontFamily: `var(--fortress-fontFamily-body)`,
    color: `var(--fortress-palette-text-primary)`,
  },
  body2: {
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    fontFamily: `var(--fortress-fontFamily-body)`,
    color: `var(--fortress-palette-text-primary)`,
  },
  caption1: {
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    fontFamily: `var(--fortress-fontFamily-body)`,
    color: `var(--fortress-palette-text-primary)`,
    fontSize: `var(--fortress-fontSize-sm)`, // 14px
  },
  caption2: {
    lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
    fontFamily: `var(--fortress-fontFamily-body)`,
    color: `var(--fortress-palette-text-primary)`,
    fontSize: `var(--fortress-fontSize-xs)`, // 12px
  },
};
/**
 * - --fortress-lineHeight-sm: 1.25;
 * - --fortress-lineHeight-md: 1.5;
 * - --fortress-lineHeight-lg: 1.75;
 */
export const lineHeight: CssVarsThemeOptions['lineHeight'] = {
  sm: 1.25, // var(--fortress-lineHeight-sm)
  md: 1.5, // var(--fortress-lineHeight-md)
  lg: 1.75, // var(var(--fortress-lineHeight-lg)
};
