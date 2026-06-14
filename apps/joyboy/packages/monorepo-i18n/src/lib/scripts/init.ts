import { createInstance, type InitOptions, type Module, type NewableModule, type Newable } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions, getExtensions, getI18nIcuOptions } from '../settings';
import ICU from 'i18next-icu';
import { Bcp47Locales, LocalesNamespace } from '../types';

type InitI18nOptions = {
  lng: Bcp47Locales;
  ns?: LocalesNamespace | LocalesNamespace[];
} & Partial<InitOptions>;

export async function initI18n({
  options,
  extensions,
}: {
  options: InitI18nOptions | (() => InitI18nOptions);
  extensions?: Module[] | NewableModule<Module>[] | Newable<Module>[];
}) {
  const i18n = createInstance();
  i18n.use(ICU);
  i18n.use(initReactI18next);

  const defaultOptions = getOptions();
  const defaultExtensions = getExtensions();
  const allExtensions = [...defaultExtensions, ...(extensions || [])];

  // 使用reduce方法处理extendOptions数组，实现链式调用
  const configuredI18n = Array.isArray(allExtensions)
    ? allExtensions.reduce((acc, option) => {
        // 假设option是一个函数，接受i18n实例并返回i18n实例
        return acc.use(option);
      }, i18n)
    : i18n;

  const mergeDefaultOptions = {
    ...defaultOptions,
    ...(typeof options === 'function' ? options() : options),
  };

  await configuredI18n.init({
    ...mergeDefaultOptions,
    ...getI18nIcuOptions(mergeDefaultOptions.lng as Bcp47Locales),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const modules: Record<string, any> = {};

  //   i18n.on('languageChanged', (lng) => {
  //     //
  //     Object.values(modules).forEach((module) => {
  //       if (module.onLanguageChanged) {
  //         module.onLanguageChanged(lng);
  //       }
  //     });
  //   });
  //   return {
  //     registerModule: <T extends Module>(name: string, module: NewableModule<T>) => {
  //       modules[name] = new module(i18n);
  //     },
  //   };
  return i18n;
}
