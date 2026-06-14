import { Bcp47Locales } from '../types';

export function formatNumber(locale: Bcp47Locales, options: Intl.NumberFormatOptions) {
  const formattedValue = new Intl.NumberFormat(locale, options);

  return formattedValue;
}
