import { fallbackLocale } from '../settings';
import { Bcp47Locales } from '../types';
import localeCurrency from 'locale-currency';

/**
 * 通过locale获取货币代码
 * @param locale eg: 'en-US'
 * @returns 货币代码 eg: 'USD'
 */
export function getCurrencyCodeByLocale(locale: string) {
  const currencyCode = localeCurrency.getCurrency(locale);
  return currencyCode || localeCurrency.getCurrency(fallbackLocale) || '';
}

export enum SpecialCurrencyCode {
  CAD = 'CAD',
}
const specialCurrencyCodes = Object.values(SpecialCurrencyCode); //OUTPUT: ['CAD']

const specialCurrencyFormatHandles = {
  [SpecialCurrencyCode.CAD]: function (value: string) {
    return value.replace('$', 'C$');
  },
};
export const isSpecialCurrency = (currencyCode: string) =>
  specialCurrencyCodes.includes(currencyCode as SpecialCurrencyCode);

/**
 * 获取货币格式化选项
 * @param currency 货币代码
 * @param region 区域代码
 * @returns 货币格式化选项
 */
export function getCurrencyFormatOptions(currencyCode: string): Intl.NumberFormatOptions {
  return {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // 限制小数位数, 通常默认是2位
    currencyDisplay: 'narrowSymbol', // todo:ssr 需要兼容, symbol
    // currencyDisplay: typeof window === 'undefined' ? 'symbol' : 'narrowSymbol', // node环境下， intl还未兼容narrowSymbol
  };
}

/**
 * 通过locale获取货币格式化选项
 * @param locale eg: 'en-US'
 * @returns 货币格式化选项
 */
export function getCurrencyFormatOptionsByLocale(locale: Bcp47Locales) {
  const currencyCode = getCurrencyCodeByLocale(locale);
  return getCurrencyFormatOptions(currencyCode);
}

/**
 * 格式化货币
 * @param value 货币值 eg: 100 或 '100'
 * @param locale 语言代码 eg: 'en-US'
 * @returns 格式化后的货币值 eg: '$100.00'
 */
export function formatCurrency(value: number | string, locale: Bcp47Locales): string {
  if (!locale) {
    return value as string;
  }

  const valueNumber = Number(value);
  if (isNaN(valueNumber)) {
    return value as string;
  }

  const currencyCode = getCurrencyCodeByLocale(locale);
  const options = getCurrencyFormatOptions(currencyCode);

  const formattedValue = new Intl.NumberFormat(locale, options).format(value);

  if (isSpecialCurrency(currencyCode)) {
    return specialCurrencyFormatHandles[currencyCode as SpecialCurrencyCode](formattedValue) || formattedValue;
  }
  return formattedValue;
}
