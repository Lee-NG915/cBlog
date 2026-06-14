'use client';

import { formatCurrency } from './currency.util';
import { getLocaleClient } from './locale.client';

export function formatCurrencyClient(value: number | string) {
  const locale = getLocaleClient();
  return formatCurrency(value, locale);
}
