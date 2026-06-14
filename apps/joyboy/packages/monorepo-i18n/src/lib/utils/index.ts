import { formatCurrencyServer } from './currency-format.server';
import { formatCurrencyClient } from './currency-format.client';
import { formatNumber } from './number-format';
import { getLocaleClient } from './locale.client';

/**
 * 格式化货币函数
 * @deprecated Use `formatPriceClient` from `@castlery/monorepo-i18n` in Client Components, or
 * `formatPriceServer` from `@castlery/monorepo-i18n/server` in Server Components.
 * @returns `server-side` ((value: number | string) => Promise<string>)
 * @returns `client-side` ((value: number | string) => string)
 */
export const formatPrice = typeof window === 'undefined' ? formatCurrencyServer : formatCurrencyClient;

export * from './locale-check.util';

export {
  formatCurrencyClient,
  formatCurrencyClient as formatPriceClient,
  formatCurrencyServer,
  formatCurrencyServer as formatPriceServer,
};

export function formatNumberClient(options: Intl.NumberFormatOptions) {
  const locale = getLocaleClient();
  return formatNumber(locale, options);
}
