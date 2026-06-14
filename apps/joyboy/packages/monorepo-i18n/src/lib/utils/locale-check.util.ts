import { EC_COUNTRIES_ENUM } from '../adapters';
import { regionalSupportedLocales } from '../settings';
import { Bcp47Locales } from '../types';

/**
 * Check if a locale is supported in a region
 * @param locale - The locale to check
 * @param region - The region to check
 * @returns true if the locale is supported in the region, false otherwise
 */
export const isRegionalSupportedLocale = (locale: string, region: string) => {
  if (!locale || !region) return false;
  const upperCaseRegion = region.toUpperCase() as keyof typeof EC_COUNTRIES_ENUM.Enum;
  const supportedLocales = regionalSupportedLocales[upperCaseRegion];
  return !!supportedLocales?.includes(locale as Bcp47Locales);
};
