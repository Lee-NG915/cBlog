'use client';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { isSupportedLocale, fallbackLocale } from '../settings';
import { Bcp47Locales } from '../types';

export function getLocaleClient(): Bcp47Locales {
  // During SSR of client components, skip cookie access to avoid calling
  // async Server Functions (cookies() from next/headers via cookies-next v4)
  if (typeof window === 'undefined') {
    return fallbackLocale as Bcp47Locales;
  }
  const persistenceHandles = makePersistenceHandles({});
  const locale = persistenceHandles.preferredLanguage.getItem();
  if (locale && isSupportedLocale(locale)) {
    return locale as Bcp47Locales;
  }
  return fallbackLocale as Bcp47Locales;
}
