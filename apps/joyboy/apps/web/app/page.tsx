import React from 'react';
import { fallbackLocale, isSupportedLocale, LocalesNamespace, translationServer } from '@castlery/monorepo-i18n/server';
import { cookies } from 'next/headers';
import { Card, Typography } from '@castlery/fortress';
import NLink from 'next/link';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

/**
 * This page component acts as a root-level page for locale redirection.
 * If the locale cookie isn't set, it redirects the user to the default one.
 * For the actual content, please visit the "app/[locale]/page.tsx" page component.
 */
export default async function RootPage() {
  const storageLocale = makePersistenceHandles().preferredLanguage.getItem({ cookies }) ?? '';
  const locale = isSupportedLocale(storageLocale) ? storageLocale : fallbackLocale;

  const { t } = await translationServer(LocalesNamespace.SHARED, {
    keyPrefix: 'welcome',
  });

  return (
    <Card>
      <Typography level="h1">{t('title')}</Typography>
      <Typography level="h3">{t('desc')}</Typography>
      <NLink href={`sg`} replace locale={locale}>
        {t('sg')} - {t('button')}
      </NLink>
      <NLink href={`us`} replace locale={locale}>
        {t('us')} - {t('button')}
      </NLink>
      <NLink href={`au`} replace locale={locale}>
        {t('au')} - {t('button')}
      </NLink>
      <NLink href={`/authTest`} replace locale={locale}>
        Test
      </NLink>
    </Card>
  );
}
