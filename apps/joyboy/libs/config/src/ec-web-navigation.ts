// import { preferedRegion } from '@castlery/shared-persistence-kit'; // todo :eslint check
import { getCookie } from 'cookies-next';

export const defaultRegion = 'sg';
export const supportRegions = ['sg', 'us', 'au', 'ca', 'uk'];
export const regionCookieName = 'xxxxx';

/**
 * Detects the user's region based on a cookie, defaults to 'sg'
 * @returns
 */
export const detectRegion = () => {
  const region = supportRegions.find((r) => r === getCookie(regionCookieName));
  return region;
};

export const isSupportedRegion = (region: string) => {
  return !!supportRegions.find((r) => r === region);
};

/**
 * Get the valid region from the pathname
 * @param pathname
 * @param locale
 * @returns
 */
export const getRegionInPathname = (pathname: string, locale: string) => {
  const pathStr = locale ? pathname.replace(`/${locale}`, '') : pathname;
  const region = supportRegions.find((r) => pathStr.startsWith(`/${r}`));
  if (region && isSupportedRegion(region)) {
    return region;
  }
  return '';
};
