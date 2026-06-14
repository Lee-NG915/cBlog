import mediaQuery from 'css-mediaquery';
import Breakpoint from '../Theme/breakpoints';
export const isSSR = () => typeof window === 'undefined';

export const getSsrMatchMedia =
  // default to desktop
  (device = 'mobile') => {
    const widthValues: Record<string, number> = {
      desktop: Breakpoint.values.lg,
      tablet: Breakpoint.values.tablet,
      mobile: Breakpoint.values.mobile,
    };
    return (query: string) => ({
      matches: mediaQuery.match(query, {
        // The estimated CSS width of the browser.
        width: `${widthValues[device]}px`,
      }),
    });
  };
