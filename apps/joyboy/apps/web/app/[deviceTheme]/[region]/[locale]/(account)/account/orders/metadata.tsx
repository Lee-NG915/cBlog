import { LocalesNamespace, translationServer } from '@castlery/monorepo-i18n/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await translationServer(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage.metadata',
  });
  return {
    title: t('title'),
  };
}
