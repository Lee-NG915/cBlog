import { LocalesNamespace, translationServer } from '@castlery/monorepo-i18n/server';
import React from 'react';
import { CountrySelectPageClient } from './page.client';
import { cookies } from 'next/headers';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function CountrySelectPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });
  const { t } = await translationServer(LocalesNamespace.SHARED, { keyPrefix: 'landingPage' });

  const cookieStore = cookies();
  const webCountryCode = cookieStore.get('country_code')?.value;

  const links = [
    { href: '/us', text: t('us'), value: 'us' },
    { href: '/sg', text: t('sg'), value: 'sg' },
    { href: '/au', text: t('au'), value: 'au' },
    { href: '/ca', text: t('ca'), value: 'ca' },
    { href: '/uk', text: t('uk'), value: 'uk' },
  ];

  return (
    <div>
      <CountrySelectPageClient links={links} CC={webCountryCode} />
    </div>
  );
}
