import { CssVarsThemeOptions } from '@mui/joy';

export const fontFamilyV2: CssVarsThemeOptions['fontFamily'] = {
  // var(--fortress-fontFamily-body)
  body: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
  // var(--fortress-fontFamily-display)
  display: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'].join(','),
};

type LetterSpacing = {
  xs: string;
  md: string;
  lg: string;
};

export const letterSpacingV2: LetterSpacing = {
  xs: '-0.03em',
  md: '0em',
  lg: '0.2em',
};

/**
 * - --fortress-fontWeight-sm: 300;
 * - --fortress-fontWeight-md: 400;
 * - --fortress-fontWeight-lg: 600;
 * - --fortress-fontWeight-xl: 700;
 */
export const fontWeightV2: CssVarsThemeOptions['fontWeight'] = {
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
 * | xl3  | 1.4    | 24   |
 * | xl4  | 1.75   | 28   |
 * | xl5  | 2      | 32   |
 * | xl6  | 2.5625 | 41   |
 */
export const fontSizeV2: CssVarsThemeOptions['fontSize'] = {
  xs: '0.75rem', // 12px - subh3, caption1 (mobile), caption2
  sm: '0.875rem', // 14px - subh2, body2 (mobile), caption1 (desktop)
  md: '1rem', // 16px - h5 (mobile), h4 (mobile), subh1, body1 (mobile), body2 (desktop)
  lg: '1.125rem', // 18px - h4 (mobile), h5 (desktop), subh1 (desktop), body1 (desktop)
  xl: '1.25rem', // 20px - h3 (mobile)
  xl2: '1.375rem', // 22px - h4 (desktop), h2 (mobile)
  xl3: '1.5rem', // 24px - h1 (mobile)
  xl4: '1.75rem', // 28px - h3 (desktop)
  xl5: '2rem', // 32px - h2 (desktop)
  xl6: '2.125rem', // 34px - h1 (desktop)
};
export const typographyV2: CssVarsThemeOptions['typography'] = {
  h1: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    fontDisplay: 'swap',
    lineHeight: `var(--fortress-lineHeight-xs)`, // 1.2
    letterSpacing: letterSpacingV2.xs,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-xl3)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-xl3)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-xl6)`,
    },
  },
  h2: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-xs)`, // 1.2
    letterSpacing: letterSpacingV2.xs,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-xl2)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-xl2)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-xl5)`,
    },
  },
  h3: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-xs)`, // 1.2
    letterSpacing: letterSpacingV2.xs,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-xl)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-xl)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-xl4)`,
    },
  },
  h4: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-xs)`,
    letterSpacing: letterSpacingV2.xs,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-lg)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-lg)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-xl2)`,
    },
  },
  h5: {
    fontFamily: `var(--fortress-fontFamily-display)`,
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-xs)`, // 1.2
    letterSpacing: letterSpacingV2.xs,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-lg)`,
    },
  },
  subh1: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    fontFamily: `var(--fortress-fontFamily-body)`,
    letterSpacing: letterSpacingV2.lg,
    // lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    lineHeight: `normal`,
    textTransform: 'uppercase', // 默认转大写
    // color: `var(--fortress-palette-brand-mono-900)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
  },
  subh2: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    fontFamily: `var(--fortress-fontFamily-body)`,
    letterSpacing: letterSpacingV2.lg,
    // lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    lineHeight: `normal`,
    textTransform: 'uppercase',
    // color: `var(--fortress-palette-brand-mono-900)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
  },
  subh3: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    fontFamily: `var(--fortress-fontFamily-body)`,
    letterSpacing: letterSpacingV2.lg,
    // lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    lineHeight: `normal`,
    // color: `var(--fortress-palette-brand-mono-900)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-xs)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-xs)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-xs)`,
    },
  },
  body1: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    fontFamily: `var(--fortress-fontFamily-display)`,
    letterSpacing: letterSpacingV2.md,
    // color: `var(--fortress-palette-text-primary)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-lg)`,
    },
  },
  body2: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    fontFamily: `var(--fortress-fontFamily-display)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    letterSpacing: letterSpacingV2.md,
    // color: `var(--fortress-palette-text-primary)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-md)`,
    },
  },
  caption1: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    fontFamily: `var(--fortress-fontFamily-display)`,
    letterSpacing: letterSpacingV2.md,
    // color: `var(--fortress-palette-text-primary)`,
    // mobile
    '@media (min-width: 0px) and (max-width: 600px)': {
      fontSize: `var(--fortress-fontSize-xs)`,
    },
    // tablet
    '@media (min-width: 601px) and (max-width: 900px)': {
      fontSize: `var(--fortress-fontSize-xs)`,
    },
    // desktop
    '@media (min-width: 901px)': {
      fontSize: `var(--fortress-fontSize-sm)`,
    },
  },
  caption2: {
    fontWeight: `var(--fortress-fontWeight-md)`,
    lineHeight: `var(--fortress-lineHeight-md)`, // 1.4
    fontFamily: `var(--fortress-fontFamily-display)`,
    // color: `var(--fortress-palette-text-primary)`,
    fontSize: `var(--fortress-fontSize-xs)`,
    letterSpacing: letterSpacingV2.md,
  },
};
/**
 * - --fortress-lineHeight-xs: 1.2;
 * - --fortress-lineHeight-sm: 1.25;
 * - --fortress-lineHeight-md: 1.4;
 * - --fortress-lineHeight-lg: 1.75;
 */
export const lineHeightV2: CssVarsThemeOptions['lineHeight'] = {
  xs: 1.2, // var(--fortress-lineHeight-xs)
  sm: 1.25, // var(--fortress-lineHeight-sm)
  md: 1.4, // var(--fortress-lineHeight-md)
  lg: 1.75, // var(var(--fortress-lineHeight-lg)
};
