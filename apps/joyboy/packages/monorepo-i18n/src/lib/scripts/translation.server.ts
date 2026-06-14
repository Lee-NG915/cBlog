'use server';
import type { KeyPrefix } from 'i18next';
import { LocalesNamespace } from '../types';
import { getLocaleServer } from '../utils/locale.server';
import { initI18n } from './init';

// https://github.com/i18next/next-i18next
export async function translationServer<NS extends LocalesNamespace, KP extends KeyPrefix<NS> = undefined>(
  ns: NS | NS[],
  options?: { keyPrefix?: KP }
) {
  const locale = await getLocaleServer();
  const i18nInstance = await initI18n({ options: { lng: locale, ns } });
  const keyPrefix = options?.keyPrefix ?? '';
  const primaryNs = Array.isArray(ns) ? ns[0] : ns;

  return {
    t: i18nInstance.getFixedT<NS, KP>(locale, primaryNs, keyPrefix as KP),
    i18n: i18nInstance,
  };
}
