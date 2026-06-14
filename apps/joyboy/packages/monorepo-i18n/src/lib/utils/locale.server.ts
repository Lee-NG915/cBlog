'use server';
import { cookies } from 'next/headers';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { isSupportedLocale, fallbackLocale } from '../settings';
import { Bcp47Locales } from '../types';

export async function getLocaleServer(): Promise<Bcp47Locales> {
  const persistenceHandles = makePersistenceHandles({ cookies });
  const locale = persistenceHandles.preferredLanguage.getItem();

  if (locale && isSupportedLocale(locale)) {
    return locale as Bcp47Locales;
  }

  return fallbackLocale as Bcp47Locales;
}
