import { getCurrencyFormatOptionsByLocale } from '../utils/currency.util';
import { Bcp47Locales } from '../types';

export function getI18nIcuOptions(lng: Bcp47Locales) {
  return {
    i18nFormat: {
      formats: {
        number: {
          currency: {
            ...getCurrencyFormatOptionsByLocale(lng),
          },
        },
      },
    },
  };
}
