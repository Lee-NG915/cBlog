'use client';

import { formatNumber } from './lib/utils/number-format';
import { getLocaleClient } from './lib/utils/locale.client';

export { Trans } from 'react-i18next';
export type { UseTranslationOptions } from 'react-i18next';
export { dir } from 'i18next';
export type { KeyPrefix } from 'i18next';

export * from './lib/types';
export { LocalesNamespace } from './lib/types';
export { useTranslation } from './lib/scripts/useTranslation.client';
export { formatCurrencyClient, formatCurrencyClient as formatPriceClient } from './lib/utils/currency-format.client';
export { getLocaleClient } from './lib/utils/locale.client';
export * from './lib/utils/locale-check.util';

export function formatNumberClient(options: Intl.NumberFormatOptions) {
  const locale = getLocaleClient();
  return formatNumber(locale, options);
}
