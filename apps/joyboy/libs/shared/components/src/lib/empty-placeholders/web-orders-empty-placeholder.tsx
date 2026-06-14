'use client';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { CommonTemplate } from './common-template/common-template';

export function WebOrdersEmptyPlaceholder() {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage.emptyState',
  });
  const homepageUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['home']}`;
  return <CommonTemplate title={t('title')} description={t('description')} cta={t('cta')} ctaUrl={homepageUrl} />;
}
