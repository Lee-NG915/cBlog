'use client';

import { useEffect, useState } from 'react';
import { useTranslation as useTranslationOrg, type UseTranslationOptions } from 'react-i18next';
import type { KeyPrefix } from 'i18next';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { initI18n } from './init';
import { Bcp47Locales, LocalesNamespace } from '../types';
import { getLocaleClient } from '../utils/locale.client';
import { logger } from '@castlery/observability/client';

const runsOnServerSide = typeof window === 'undefined';
const persistenceHandles = makePersistenceHandles(); // 避免每次渲染都创建新实例

const targetLocale = getLocaleClient();

initI18n({ options: { lng: targetLocale as Bcp47Locales } });

export function useTranslation<NS extends LocalesNamespace, KP extends KeyPrefix<NS> = undefined>(
  ns: NS,
  options?: UseTranslationOptions<KP>
) {
  const lng = getLocaleClient();
  // 这时 i18nInstance 已经存在，正常使用 react-i18next 的 useTranslation
  const { i18n, ...rest } = useTranslationOrg<NS, KP>(ns, options);

  // ready 状态，代表资源是否加载完成
  const [ready, setReady] = useState(() => i18n?.hasResourceBundle(lng, ns));

  // 监听 namespace 加载，未加载则加载
  useEffect(() => {
    if (ready) return;
    i18n.loadNamespaces(ns, () => {
      setReady(true);
    });
  }, [ready, ns, i18n]);

  // 监听语言变化，更新本地状态
  const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

  useEffect(() => {
    if (activeLng === i18n.resolvedLanguage) return;
    setActiveLng(i18n.resolvedLanguage);
  }, [i18n.resolvedLanguage]);

  // 语言变更时，调用 i18n.changeLanguage
  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return;
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  // 同步语言到持久化存储
  useEffect(() => {
    if (persistenceHandles.preferredLanguage.getItem() === lng) return;
    persistenceHandles.preferredLanguage.setItem(lng);
  }, [lng]);

  // SSR 情况下保证语言同步
  useEffect(() => {
    if (!runsOnServerSide || !lng || i18n.resolvedLanguage === lng) return;
    i18n.changeLanguage(lng, (err) => {
      if (err) {
        logger.error('Failed to change i18next language on server side', {
          error: err instanceof Error ? err.message : String(err),
          targetLanguage: lng,
          currentLanguage: i18n.resolvedLanguage,
          context: 'i18n_language_change',
        });
      }
      persistenceHandles.preferredLanguage.setItem(lng);
    });
  }, [lng, i18n]);

  return { ...rest, i18n, ready };
}
