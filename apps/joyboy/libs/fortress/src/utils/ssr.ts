import Breakpoint from '../Theme/breakpoints';
import { match } from 'css-mediaquery';

export function getSsrMatchMedia(device = 'mobile') {
  const widthValues: Record<string, number> = {
    desktop: Breakpoint.values.lg,
    tablet: Breakpoint.values.sm,
    mobile: Breakpoint.values.xs,
  };
  return (query: string) => ({
    matches: match(query, {
      // The estimated CSS width of the browser.
      width: `${widthValues[device]}px`,
    }),
  });
}

// export const getSsrMatchMedia =
//   // default to desktop
//   (device = 'mobile') => {
//     const widthValues: Record<string, number> = {
//       desktop: Breakpoint.values.lg,
//       tablet: Breakpoint.values.tablet,
//       mobile: Breakpoint.values.mobile,
//     };
//     return (query: string) => ({
//       matches: mediaQuery.match(query, {
//         // The estimated CSS width of the browser.
//         width: `${widthValues[device]}px`,
//       }),
//     });
//   };
