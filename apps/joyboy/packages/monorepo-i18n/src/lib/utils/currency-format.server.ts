'use server';

import { getLocaleServer } from './locale.server';
import { formatCurrency } from './currency.util';

export async function formatCurrencyServer(value: number | string) {
  const locale = await getLocaleServer();
  return formatCurrency(value, locale);
}
