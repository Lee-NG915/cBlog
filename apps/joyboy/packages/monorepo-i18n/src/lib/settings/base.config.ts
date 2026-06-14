import { LocalesNamespace, Bcp47Locales, Languages } from '../types';
import { EC_COUNTRIES_ENUM, envVariables } from '../adapters';

// 了解language和locale的区别: https://localizely.com/blog/language-vs-locale/
//https://locize.com/blog/next-app-dir-i18n/
/**
 * 支持的语言
 * @example ['en']
 */
export const supportLanguages = [Languages.EN]; // Output: ['en']

/**
 * 支持的语言标签
 * @example ['en-US', 'en-CA', 'en-SG', 'en-AU', 'en-GB']
 */
export const supportLocales = [
  // Output: ['en-US', 'en-CA', 'en-SG', 'en-AU', 'en-GB']
  Bcp47Locales.EN_US,
  Bcp47Locales.EN_CA,
  Bcp47Locales.EN_SG,
  Bcp47Locales.EN_AU,
  Bcp47Locales.EN_GB,
];

/**
 * The locales supported by the region
 * @default `regionalSupportedLocales[region][0]` is the regional default locale
 * @example ca:['en-CA','fr-CA'] => The default locale is 'en-CA' in ca market
 */
export const regionalSupportedLocales = {
  // 为什么必须维护REGIONAL_SUPPORTED_LOCALES？
  // 因为开启acceptLanguageHeader后，CA的用户可能会检测到en-US为首选语言，但en-US的translation中，是针对US市场维护的翻译，可能会出现 Castlery US 等信息，不符合实际使用
  [EC_COUNTRIES_ENUM.Enum.SG]: [Bcp47Locales.EN_SG],
  [EC_COUNTRIES_ENUM.Enum.US]: [Bcp47Locales.EN_US],
  [EC_COUNTRIES_ENUM.Enum.AU]: [Bcp47Locales.EN_AU],
  [EC_COUNTRIES_ENUM.Enum.CA]: [Bcp47Locales.EN_CA],
  [EC_COUNTRIES_ENUM.Enum.UK]: [Bcp47Locales.EN_GB],
};

export const fallbackLng = Languages.EN;
/**
 * 回退语言,每个市场的回退语言
 * eg:
 * sg: en-SG
 * us: en-US
 */
export const fallbackLocale = envVariables.ecRegionalFallbackLocale;

//path: packages/monorepo-i18n/src/lib/locales/en/web/translation.json
//path: packages/monorepo-i18n/src/lib/locales/en/modules/cart/translation.json
export const defaultNS = `${LocalesNamespace.SHARED}`;

/**
 * check if the language is supported
 * @param lng language code eg: 'en'
 * @returns
 */
export const isSupportedLanguage = (lng: string) => {
  return !!supportLanguages.find((lang) => lang === lng);
};

/**
 * check if the locale is supported
 * @param locale eg: 'en-US'
 * @returns
 */
export const isSupportedLocale = (locale: string) => {
  return !!supportLocales.find((loc) => loc === locale);
};
