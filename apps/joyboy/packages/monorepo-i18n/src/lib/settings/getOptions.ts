import { preferredLanguage } from '@castlery/shared-persistence-kit';
import { fallbackLocale, supportLocales, defaultNS } from './base.config';

/**
 * see more about the options : https://www.i18next.com/overview/configuration-options
 * https://locize.com/blog/next-app-dir-i18n/
 * @param lng
 * @param ns
 * @returns
 */
export function getOptions(lng = '', ns = '') {
  return {
    debug: false,
    /**
     * Allow initializing with bundled resources while using a backend to load non bundled ones.
     * @default true
     */
    partialBundledLanguages: true,
    /**
     * Language to use (overrides language detection
     * @default undefined
     */
    lng,
    supportedLngs: supportLocales,
    fallbackLng: [fallbackLocale], // 不设置fallback了，因为目前的需求，多个市场不存在可共用的fallback
    nonExplicitSupportedLngs: false, // 关闭自动回退
    load: 'currentOnly',
    /**
     * Array of languages to preload. Important on server-side to assert translations are loaded before rendering views.
     * @default false
     */
    preload: [lng],
    /**
     * String or array of namespaces to load
     * @default 'translation'
     */
    ns,
    /**
     * Default namespace used if not passed to translation function
     * @default 'translation'
     */
    defaultNS,
    // fallbackNS: defaultNS,
    /**
     * 使用extensions实现资源加载时，无需配置下面选项
     */
    // localePath: '/locales',
    // localeStructure: '{{lng}}/{{ns}}',
    // localeExtension: 'json',
    // 默认加载的命名空间
    // namespace: [ns],
    // loadNamespace: [ns],
    // load: 'currentOnly', // 只加载当前语言，包含区域代码
    // ---------------- 待定 ----------------
    detection: {
      order: ['cookie'],
      lookupCookie: preferredLanguage,
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      //使用ICU时，format参数不再生效
      // format: function (value: any, format: string, lng: string, options = {}) {
      //   console.log('customFormat', value, format, lng, options);
      //   return value;
      // }
    },
  };
}
